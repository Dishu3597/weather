import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./app.css";

const BASE_URL = "https://weather-fvsx.onrender.com";
const BACKGROUND_URL = "/bg1.jpg";

/* 🔑 MAPBOX TOKEN */
const MAPBOX_TOKEN = "YOUR_MAPBOX_TOKEN_HERE";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const defaultCity = "Delhi";

  useEffect(() => {
    fetchWeather(defaultCity);
  }, []);

  const fetchWeather = async (cityName) => {
    const cityToFetch = cityName || city;
    if (!cityToFetch) {
      setError("Please enter a city name!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const weatherRes = await fetch(`${BASE_URL}/weather?city=${cityToFetch}`);
      const weatherData = await weatherRes.json();

      if (weatherData.error) {
        setError(weatherData.error);
        setWeather(null);
        return;
      }

      setWeather(weatherData);

      const forecastRes = await fetch(`${BASE_URL}/forecast?city=${cityToFetch}`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData.forecast || []);

      const aqiRes = await fetch(
        `${BASE_URL}/aqi?lat=${weatherData.lat}&lon=${weatherData.lon}`
      );
      const aqiData = await aqiRes.json();
      setAqi(aqiData);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- HELPERS ---------- */

  const getWeatherImage = (condition) => {
    if (!condition) return "/illustrations/sunny.png";
    condition = condition.toLowerCase();

    if (
      condition.includes("rain") ||
      condition.includes("drizzle") ||
      condition.includes("thunder")
    )
      return "/illustrations/rainy.png";

    if (
      condition.includes("cloud") ||
      condition.includes("mist") ||
      condition.includes("haze") ||
      condition.includes("fog")
    )
      return "/illustrations/cloudy.png";

    if (condition.includes("snow")) return "/illustrations/snowy.png";

    return "/illustrations/sunny.png";
  };

  const getWeatherEmoji = (condition) => {
    if (!condition) return "❓";
    condition = condition.toLowerCase();

    if (condition.includes("cloud")) return "☁️";
    if (condition.includes("rain")) return "🌧️";
    if (condition.includes("clear") || condition.includes("sun")) return "☀️";
    if (condition.includes("snow")) return "❄️";
    if (condition.includes("thunder")) return "🌩️";
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

  /* 🌍 MAPBOX STATIC MAP */
  const getCityMap = (lat, lon) => {
  if (!lat || !lon) return "";

  return `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=600,400&z=10&l=map`;
};


  /* ---------- UI ---------- */

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: `url(${BACKGROUND_URL})`,
      }}
    >
      <div className="overlay" />

      <h1 className="app-title">Weatherly</h1>

      {/* Search */}
      <div className="input-container">
        <input
          className="city-input"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={() => fetchWeather()}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <div className="error-card">{error}</div>}

      {/* ========= MAIN WEATHER CARD ========= */}
      {weather && (
        <motion.div
          className="city-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="city-header">
            <h2>{weather.city}</h2>
            <p>{new Date().toDateString()}</p>
          </div>

          <div className="icon-wrapper">
            <img
              src={getWeatherImage(weather.condition)}
              alt="weather"
            />
          </div>

          <h1 className="temp">{weather.temp}°C</h1>
          <p className="condition">{weather.condition}</p>

          {/* 🌍 MAPBOX CITY MAP */}
          <div className="city-illustration">
            <img
              src={getCityMap(weather.lat, weather.lon)}
              alt="city map"
            />
          </div>
        </motion.div>
      )}

      {/* ========= AQI CARD ========= */}
      {aqi && (
        <div className="weather-card aqi-card">
          <h3>🌫️ Air Quality Index</h3>
          <p>Status: {getAQIStatus(aqi.aqi)}</p>
          <p>PM2.5: {aqi.pm2_5}</p>
          <p>PM10: {aqi.pm10}</p>
        </div>
      )}

      {/* ========= FORECAST ========= */}
      {forecast.length > 0 && (
        <div className="forecast-container">
          <h3>🕒 Forecast</h3>
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

