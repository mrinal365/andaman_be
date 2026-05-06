const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Please add a location']
    },
    date: {
        type: String,
        required: [true, 'Please add a date']
    },
    avgTemp: {
        type: Number,
        required: true
    },
    maxTemp: {
        type: Number,
        required: true
    },
    minTemp: {
        type: Number,
        required: true
    },
    avgFeelsLike: {
        type: Number,
        required: true
    },
    avgHumidity: {
        type: Number,
        required: true
    },
    avgWindSpeed: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    fetchedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Weather', WeatherSchema);