const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ColorSchema = new Schema({
    name: { type: String, required: true, maxLength: 100, unique: true, },
    description: { type: String, maxLength: 10000 },
})

// Virtual for Candle's URL
ColorSchema.virtual("url").get(function () {
    // Arrow function not used since we'll need the this object
    return `/catalog/color/${this._id}`;
});

// Export the model
module.exports = mongoose.model("Color", ColorSchema);