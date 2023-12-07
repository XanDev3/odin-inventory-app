const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CandleSchema = new Schema({
    name: { type: String, required: true, maxLength: 100, unique: true, },
    description: { type: String, required: true, maxLength: 10000 },
    number_in_stock: { type: Number, required: true, min: [0, "Can't go less than 0"], max: [9000, "It's Over 9000!"] },
    color: [{ type: Schema.Types.ObjectId, ref: "Color" }],
    scent: [{ type: Schema.Types.ObjectId, ref: "Scent" }],
    image: { type: String }, // Add image property
})

// Virtual for Candle's URL
CandleSchema.virtual("url").get(function () {
    // Arrow function not used since we'll need the this object
    return `/catalog/candle/${this._id}`;
});

// Export the model
module.exports = mongoose.model("Candle", CandleSchema);