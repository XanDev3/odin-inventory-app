#! /usr/bin/env node

console.log(
    'This script populates some test candles, colorss, and scents to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Candle = require("./models/candle");
  const Color = require("./models/color");
  const Scent = require("./models/scent");
  
  const candles = [];
  const colors = [];
  const scents = [];
  
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createColors();
    await createScents();
    await createCandles();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // color[0] will always be the blue color, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function colorCreate(index, name, description) {
    const color = new Color({ name: name,  description: description, });
    await color.save();
    colors[index] = color;
    console.log(`Added color: ${name}`);
  }
  
  async function scentCreate(index, name, description) {
    const scent = new Scent({ name: name,  description: description, });
    await scent.save();
    scents[index] = scent;
    console.log(`Added scent: ${name}`);
  }
  
  async function candleCreate(index, name, description, number_in_stock, color, scent) {
    const candledetail = {
      name: name,
      description: description,
      number_in_stock: number_in_stock,
      color: color,
      scent: scent,
    }
    const candle = new Candle(candledetail);
    await candle.save();
    candles[index] = candle;
    console.log(`Added candle: ${name}`);
  }
  
  async function createColors() {
    console.log("Adding colors");
    await Promise.all([
      colorCreate(0, "Blue", "Described as calm and serene"),
      colorCreate(1, "Green", "Described as refreshing and tranquil"),
      colorCreate(2, "Purple", "Described as royal, luxurious, and ambitious"),
      colorCreate(3, "Cream", "Off-white, described as having a rich feeling, while being not quite yellow"),
    ]);
  }
  
  async function createScents() {
    console.log("Adding scents");
    await Promise.all([
      scentCreate(0, "Eucalyptus", "A distinct camphoraceous smell, which some people describe as sharp and slightly medicinal — kind of like rosemary.", ),
      scentCreate(1, "Driftwood", "Evokes visions of saltiness, seaside, water and lightness.", ),
      scentCreate(2, "Chamomile", "Herbal, sweet, and fresh. Reminiscent of the tea we drink to illicit calm.", ),
      scentCreate(3, "Lime Zest", "Fresh, lively, green, tonic and uplifting note.", ),
      scentCreate(4, "Matcha", "A captivating floral scent that blends earthy tones with sweet green notes.", ),
      scentCreate(5, "Vanilla", "A distinct sweet, rich and syrupy smell that feels creamy and comforting.", ),
      scentCreate(6, "Lavender", "A soft, sweet smell that if floral, herbal and evergreen woodsy all at once.", ),
      scentCreate(7, "Wild Mint", "A brisk, invigorating scent, wild mint captivates with its refreshing, cool aroma. It energizes the senses, creating a revitalizing and uplifting atmosphere.", ),
    ]);
  }
  
  async function createCandles() {
    console.log("Adding Candles");
    await Promise.all([
      candleCreate(0,
        "Outback",
        "Evoking the Australian Outback, it transforms spaces into serene retreats, offering a visually calming and aromatically revitalizing experience.",
        2,
        [colors[0],colors[1]],
        [scents[0],scents[7]]
      ),
      candleCreate(1,
        "Beach Drift",
        "Its calming hue and refreshing scent evoke the tranquility of drifting along the beach, creating a peaceful ambiance for relaxation and rejuvenation.",
        5,
        [colors[0]],
        [scents[1],scents[2]]
      ),
      candleCreate(2,
        "Afternoon Tea",
        "Transporting you to a serene tea setting, its zesty and earthy notes create a refreshing ambiance, perfect for a leisurely afternoon escape.",
        69,
        [colors[1]],
        [scents[3],scents[4]]
      ),
      candleCreate(3,
        "Fresh Linens",
        "The blend evokes the soothing essence of clean linens, creating a tranquil atmosphere that combines warmth and relaxation.",
        0,
        [colors[2],colors[3]],
        [scents[5],scents[6]]
      ),
    ]);
  }
  
  
  