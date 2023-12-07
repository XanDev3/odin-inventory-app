#! /usr/bin/env node

console.log(
    'This script adds image field to candles Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Candle = require("./models/candle");

  
  const candles = [];

  
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await getCandles()
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  async function getCandles() {
    console.log("Getting Candles");
    await Promise.all([
        console.log("updating one"),
        Candle.updateOne({ name: "Afternoon Tea"}, { image: "" }, { multi: true }, function (err, raw) {
            if (err) return handleError(err);
            console.log('The raw response from Mongo was ', raw);
          }),
        console.log(Candle.find({ name: "Afternoon Tea"}))
    ])
  }