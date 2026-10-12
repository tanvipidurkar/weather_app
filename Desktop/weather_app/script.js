const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

async function getCoords(city) {
    const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Geocoding failed (status ${response.status})`);
    }

    const data = await response.json();
    const place = data.results?.[0];

    if (!place) {
        return null;
    }

    return {
        name: place.name,
        country: place.country,
        lat: place.latitude,
        lon: place.longitude,
    };
}

async function getWeather(lat, lon) {
    const url =
        `${WEATHER_URL}?latitude=${lat}&longitude=${lon}` +
        "&current=temperature_2m,wind_speed_10m&wind_speed_unit=kmh";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather request failed (status ${response.status})`);
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("Weather data is unavailable.");
    }

    return {
        temp: data.current.temperature_2m,
        wind: data.current.wind_speed_10m,
    };
}

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const card = document.getElementById("card");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Type a city name.";
        card.classList.add("hidden");
        return;
    }

    message.textContent = "Loading…";
    card.classList.add("hidden");

    try {
        const place = await getCoords(city);

        if (!place) {
            message.textContent = `No city called "${city}" 😕`;
            return;
        }

        const weather = await getWeather(place.lat, place.lon);

        document.getElementById("place").textContent =
            `${place.name}, ${place.country}`;
        document.getElementById("temp").textContent = Math.round(weather.temp);
        document.getElementById("wind").textContent = Math.round(weather.wind);
        document.getElementById("coords").textContent =
            `Lat ${place.lat.toFixed(2)}, Lon ${place.lon.toFixed(2)}`;

        message.textContent = "";
        card.classList.remove("hidden");
    } catch (error) {
        message.textContent =
            "Could not reach the weather service. Check your internet and try again.";
        console.error(error);
    }
});