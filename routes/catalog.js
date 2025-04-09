const express = require("express");
const router = express.Router();

// Required controller modules.
const candle_controller = require("../controllers/candleController.js");
const color_controller = require("../controllers/colorController.js");
const scent_controller = require("../controllers/scentController.js");

/// Candle Routes ///
// GET catalog home page.
router.get("/", candle_controller.index);

// GET request for creating a candle. NOTE This must come before routes that display candle (uses id).
router.get("/candle/create", candle_controller.candle_create_get);

// POST request for creating candle.
router.post("/candle/create", candle_controller.candle_create_post);

// GET request to delete candle.
router.get("/candle/:id/delete", candle_controller.candle_delete_get);

// POST request to delete candle.
router.post("/candle/:id/delete", candle_controller.candle_delete_post);

// GET request to update candle.
router.get("/candle/:id/update", candle_controller.candle_update_get);

// POST request to update candle.
router.post("/candle/:id/update", candle_controller.candle_update_post);

// GET request for one candle.
router.get("/candle/:id", candle_controller.candle_detail);

// GET request for list of all candle items.
router.get("/candles", candle_controller.candle_list);

/// color ROUTES ///

// GET request for creating color. NOTE This must come before route for id (i.e. display color).
router.get("/color/create", color_controller.color_create_get);

// POST request for creating color.
router.post("/color/create", color_controller.color_create_post);

// GET request to delete color.
router.get("/color/:id/delete", color_controller.color_delete_get);

// POST request to delete color.
router.post("/color/:id/delete", color_controller.color_delete_post);

// GET request to update color.
router.get("/color/:id/update", color_controller.color_update_get);

// POST request to update color.
router.post("/color/:id/update", color_controller.color_update_post);

// GET request for one color.
router.get("/color/:id", color_controller.color_detail);

// GET request for list of all colors.
router.get("/colors", color_controller.color_list);

/// scent ROUTES ///

// GET request for creating a scent. NOTE This must come before route that displays scent (uses id).
router.get("/scent/create", scent_controller.scent_create_get);

//POST request for creating scent.
router.post("/scent/create", scent_controller.scent_create_post);

// GET request to delete scent.
router.get("/scent/:id/delete", scent_controller.scent_delete_get);

// POST request to delete scent.
router.post("/scent/:id/delete", scent_controller.scent_delete_post);

// GET request to update scent.
router.get("/scent/:id/update", scent_controller.scent_update_get);

// POST request to update scent.
router.post("/scent/:id/update", scent_controller.scent_update_post);

// GET request for one scent.
router.get("/scent/:id", scent_controller.scent_detail);

// GET request for list of all scent.
router.get("/scents", scent_controller.scent_list);


module.exports = router;