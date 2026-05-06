const Weather = require('../../models/weather/Weather');
const Location = require('../../models/weather/Location');

/**
 * Get weather forecast for a location (next 5 days stored by cron).
 * Returns location info + daily weather array sorted by date ascending.
 */
exports.getWeatherByLocationId = async (locationId) => {
    const location = await Location.findById(locationId);
    if (!location) {
        const err = new Error('Location not found');
        err.status = 404;
        throw err;
    }

    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const mongoose = require('mongoose');

    // For each date, pick only the most recently fetched entry
    const forecast = await Weather.aggregate([
        {
            $match: {
                locationId: new mongoose.Types.ObjectId(locationId),
                date: { $gte: today },
            },
        },
        { $sort: { fetchedAt: -1 } },
        {
            $group: {
                _id: "$date",
                doc: { $first: "$$ROOT" },
            },
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { date: 1 } },
    ]);

    return { location, forecast };
};

/**
 * Get all available locations.
 */
exports.getLocations = async () => {
    return Location.find().sort({ name: 1 }).lean();
};
