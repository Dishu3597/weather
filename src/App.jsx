import { useState, useEffect } from "react";
import "./app.css";

const BASE_URL = "https://weather-fvsx.onrender.com";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");

  const defaultCity = "Delhi";

  useEffect(() => {
    fetchWeather(defaultCity);
  }, []);


  const fetchCityImage = async (cityName) => {
    const UNSPLASH_ACCESS_KEY = "aMnq1TxnCHkaQ4q7m5T43NqtG70WNMTTcwHTrwUyMOY";
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${cityName}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`
      );
      const data = await response.json();
      return data?.urls?.regular || null;
    } catch (err) {
      console.error("Error fetching city image:", err);
      return null;
    }
  };

  
  const fetchWeather = async (cityName) => {
    const cityToFetch = cityName || city;
    if (!cityToFetch) {
      setError("Please enter a city name!");
      return;
    }

    setLoading(true);
    setError("");

    try {
    
      const weatherRes = await fetch(
        `${BASE_URL}/weather?city=${cityToFetch}`
      );
      const weatherData = await weatherRes.json();

      if (weatherData.error) {
        setError(weatherData.error);
        setWeather(null);
        return;
      }

      setWeather(weatherData);

      
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?city=${cityToFetch}`
      );
      const forecastData = await forecastRes.json();
      setForecast(forecastData.forecast || []);

     
      const aqiRes = await fetch(
        `${BASE_URL}/aqi?lat=${weatherData.lat}&lon=${weatherData.lon}`
      );
      const aqiData = await aqiRes.json();
      setAqi(aqiData);

      
      const cityImg = await fetchCityImage(cityToFetch);
      setBackgroundImage(cityImg || "");
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 
  const getWeatherEmoji = (condition) => {
    if (!condition) return "❓";
    condition = condition.toLowerCase();
    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("clear") || condition.includes("sun")) return "☀️";
    if (condition.includes("snow")) return "❄️";
    if (condition.includes("storm") || condition.includes("thunder")) return "🌩️";
    return "🌡️";
  };


  const getAQIStatus = (value) => {
    if (value === 1) return "Good 😁";
    if (value === 2) return "Fair ☺️";
    if (value === 3) return "Moderate 🙂";
    if (value === 4) return "Poor 😢";
    if (value === 5) return "Very Poor 😭";
    return "Unknown";
  };

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
      }}
    >
      <h1 className="app-title">Weather App 🌦️</h1>

      <div className="input-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="city-input"
        />
        <button onClick={() => fetchWeather()} className="search-button">
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <div className="error-card">{error}</div>}

      {weather && (
        <div className="weather-card">
          <h2 className="city-name">
            {weather.city}, {weather.country}
          </h2>
          <div className="weather-emoji">
            {getWeatherEmoji(weather.condition)}
          </div>
          <p className="weather-condition">{weather.condition}</p>
          <p>🌡️ Temp: {weather.temp}°C</p>
          <p>💧 Humidity: {weather.humidity}%</p>
          <p>💨 Wind: {weather.wind} km/h</p>
        </div>
      )}

      {aqi && (
        <div className="weather-card">
          <h3>🌫️ Air Quality Index</h3>
          <p>Status: {getAQIStatus(aqi.aqi)}</p>
          <p>PM2.5: {aqi.pm2_5}</p>
          <p>PM10: {aqi.pm10}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-container">
          <h3>🕒 5-Day Forecast</h3>
          <div className="forecast-list">
            {forecast.map((item, index) => (
              <div key={index} className="forecast-card">
                <p>{item.datetime}</p>
                <p>{getWeatherEmoji(item.condition)}</p>
                <p>{item.temp}°C</p>
                <p>{item.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
