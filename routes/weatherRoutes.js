const router = require("express").Router();
const ctrl = require("../controllers/weatherController");
const { protect: auth } = require("../middleware/auth");

// GET /api/weather/locations — list all locations
router.get("/weather/locations", auth, ctrl.getLocations);

// GET /api/weather/:locationId — get forecast for a location
router.get("/weather/:locationId", auth, ctrl.getWeather);

module.exports = router;
