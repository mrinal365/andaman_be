const Location = require('../../models/weather/Location');
// const PostView = require("../../models/feed/PostView");

const Weather = require('../../models/weather/Weather');

const API_KEY = process.env.OPENWEATHER_API_KEY;

const CITIES = [
    { name: "Port Blair", lat: 11.6234, lon: 92.7265 },
    // { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    // { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
];

const avg = (arr) =>
    parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2));

const mostCommon = (arr) =>
    arr.sort((a, b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();

const processWeatherData = (list) => {
    const groupedByDay = list.reduce((acc, item) => {
        const date = item.dt_txt.split(" ")[0];

        if (!acc[date]) {
            acc[date] = {
                date,
                temps: [],
                feelsLike: [],
                humidity: [],
                windSpeed: [],
                descriptions: [],
                icon: item.weather[0].icon,
            };
        }

        acc[date].temps.push(item.main.temp);
        acc[date].feelsLike.push(item.main.feels_like);
        acc[date].humidity.push(item.main.humidity);
        acc[date].windSpeed.push(item.wind.speed);
        acc[date].descriptions.push(item.weather[0].description);

        return acc;
    }, {});

    return Object.values(groupedByDay).map((day) => ({
        date: day.date,
        avgTemp: avg(day.temps),
        maxTemp: parseFloat(Math.max(...day.temps).toFixed(2)),
        minTemp: parseFloat(Math.min(...day.temps).toFixed(2)),
        avgFeelsLike: avg(day.feelsLike),
        avgHumidity: avg(day.humidity),
        avgWindSpeed: avg(day.windSpeed),
        description: mostCommon(day.descriptions),
        icon: day.icon,
    }));
};

async function fetchAndSaveData() {
    for (const city of CITIES) {
        try {
            // 1. fetch
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&cnt=40`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();

            // 2. process
            const dailyData = processWeatherData(data.list);

            // 3. find or create location
            let location = await Location.findOne({ name: city.name });
            if (!location) {
                location = await Location.create({
                    name: data.city.name,
                    lat: data.city.coord.lat,
                    lon: data.city.coord.lon,
                    country: data.city.country,
                });
            }

            // 4. save each day
            for (const day of dailyData) {
                await Weather.create({
                    locationId: location._id,
                    date: day.date,
                    avgTemp: day.avgTemp,
                    maxTemp: day.maxTemp,
                    minTemp: day.minTemp,
                    avgFeelsLike: day.avgFeelsLike,
                    avgHumidity: day.avgHumidity,
                    avgWindSpeed: day.avgWindSpeed,
                    description: day.description,
                    icon: day.icon,
                });
            }

            console.log(`✅ Weather saved for ${city.name} — ${dailyData.length} days`);

        } catch (err) {
            console.error(`❌ Failed for ${city.name}:`, err.message);
            // continues to next city even if one fails
        }
    }
}

module.exports = { fetchAndSaveData };