from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

WEATHER_API_KEY = "5e97239fc8c72e4c19e87a962b73d8c1"

CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
AQI_URL = "https://api.openweathermap.org/data/2.5/air_pollution"


@app.route("/", methods=["GET"])
def home():
    return "Weather API is running"


@app.route("/weather", methods=["GET"])
def get_weather():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City name is required"}), 400

    params = {
        "q": city,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }

    response = requests.get(CURRENT_WEATHER_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": data.get("message", "City not found")}), 404

    weather_data = {
        "city": data["name"],
        "country": data["sys"]["country"],
        "temp": data["main"]["temp"],
        "condition": data["weather"][0]["description"],
        "humidity": data["main"]["humidity"],
        "wind": data["wind"]["speed"],
        "lat": data["coord"]["lat"],
        "lon": data["coord"]["lon"]
    }

    return jsonify(weather_data)


@app.route("/forecast", methods=["GET"])
def get_forecast():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City name is required"}), 400

    params = {
        "q": city,
        "appid": WEATHER_API_KEY,
        "units": "metric"
    }

    response = requests.get(FORECAST_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": data.get("message", "Forecast not found")}), 404

    forecast_list = []
    for item in data["list"][:5]: 
        forecast_list.append({
            "datetime": item["dt_txt"],
            "temp": item["main"]["temp"],
            "condition": item["weather"][0]["description"]
        })

    return jsonify({
        "city": data["city"]["name"],
        "forecast": forecast_list
    })

@app.route("/aqi", methods=["GET"])
def get_aqi():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude required"}), 400

    params = {
        "lat": lat,
        "lon": lon,
        "appid": WEATHER_API_KEY
    }

    response = requests.get(AQI_URL, params=params)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": "Unable to fetch AQI"}), 500

    aqi_data = {
        "aqi": data["list"][0]["main"]["aqi"],
        "pm2_5": data["list"][0]["components"]["pm2_5"],
        "pm10": data["list"][0]["components"]["pm10"],
        "co": data["list"][0]["components"]["co"],
        "no2": data["list"][0]["components"]["no2"]
    }

    return jsonify(aqi_data)


if __name__ == "__main__":
    app.run(debug=True)
