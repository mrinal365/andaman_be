const service = require('../services/weather/weatherService');

exports.getWeather = async (req, res, next) => {
    try {
        const data = await service.getWeatherByLocationId(req.params.locationId);
        res.json(data);
    } catch (e) { next(e); }
};

exports.getLocations = async (req, res, next) => {
    try {
        const data = await service.getLocations();
        res.json(data);
    } catch (e) { next(e); }
};
