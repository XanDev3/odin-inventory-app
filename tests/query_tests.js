const mongoose = require('mongoose')

const allCandles = await Candle.find({}, "name")
    .sort({ name: 1 })
    .populate("color")
    .populate("scent")
    .exec()