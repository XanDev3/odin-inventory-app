const Candle = require("../models/candle")
const Color = require("../models/color")
const Scent = require("../models/scent")
// npm install express-async-handler  
// to get asyncHandler in order to catch exceptions in routers
const asyncHandler = require("express-async-handler");
// npm install express-validator
// to get input validator for express 
const { body, validationResult } = require("express-validator");
// npm install --save multer
// for file uploads
const multer = require('multer');
const path = require("path")
// enable debug module logging
const debug = require("debug")("multer")
const storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
})
// const upload = multer({ storage: storage }).single("image")
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits:{
    fileSize: 800/* 0000 */
  }, 
}).single('image');

// Index route
exports.index = asyncHandler(async (req, res, next) => {
    // Get details of candle, colors, and scent counts (in parallel)
    const [
      numCandles,
      numColors,
      numScents,
  
    ] = await Promise.all([
      Candle.countDocuments({}).exec(),
      Color.countDocuments({}).exec(),
      Scent.countDocuments({}).exec(),
    ]);
  
    res.render("index", {
      title: "Candle Inventory Home",
      candle_types_count: numCandles,
      color_count: numColors,
      scent_count: numScents,
    });
  });
  
// Display list of ALL CANDLES.
exports.candle_list = asyncHandler(async (req, res, next) => {
  const allCandles = await Candle.find({}, "name")
    .sort({ name: 1 })
    .populate("image")
    .populate("color")
    .populate("scent")
    .exec()

  res.render("candle_list", { title: "Candle List", candle_list: allCandles });
});

// Display DETAIL PAGE for a specific candle.
exports.candle_detail = asyncHandler(async (req, res, next) => {
  const candle = await Candle.findById(req.params.id)
  .populate("color")
  .populate("scent")
  .exec()

  if (candle === null) {
    // No results.
    const err = new Error("Candle not found");
    err.status = 404;
    return next(err);
  }

  res.render("candle_detail", {
    candle: candle,
  })

});

// Display CANDLE CREATE form on GET.
exports.candle_create_get = asyncHandler(async (req, res, next) => {
  const [ allColors, allScents ] = await Promise.all([
    Color.find().exec(),
    Scent.find().exec(),
  ])
  res.render("candle_form",{ 
    title: "Create Candle",
    colors: allColors,
    scents: allScents,
  });
});

// Handle CANDLE CREATE on POST.
exports.candle_create_post = [
   // Convert the color to an array.
   asyncHandler(async (req, res, next) => {
      if (!(req.body.color instanceof Array)) {
        if (typeof req.body.color === "undefined") req.body.color = [];
        else req.body.color = new Array(req.body.color);
      }
      // Convert the color to an array.
      if (!(req.body.scent instanceof Array)) {
        if (typeof req.body.scent === "undefined") req.body.scent = [];
        else req.body.scent = new Array(req.body.scent);
      }
      // Handle single file upload with field name "image"
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          debug('error on create Post, MulterError', err.message)
        } else if (err) {
          debug('error on create Post, UnhandledError', err.message)
        }
        if (err) {
          // Create a candle object with escaped and trimmed data.
        const candle = new Candle({
          name: req.body.name,
          description: req.body.description,
          number_in_stock: req.body.num_in_stock,
          color: req.body.color,
          scent: req.body.scent,
          image: req.file ? req.file.filename : null,
        })
          // Error rerender page w/ error
          const [allColors, allScents] = await Promise.all([
            Color.find().exec(),
            Scent.find().exec(),
          ]);

          // Mark our selected colors and scents as checked.
          for (const color of allColors) {
            if (candle.color.includes(color._id)) {
              color.checked = "true";
            }
          }
          for (const scent of allScents) {
            if (candle.scent.includes(scent._id)) {
              scent.checked = "true";
            }
          }
          // Render the form again with sanitized values/error messages.
          res.render("candle_form", {
            title: "Create Candle",
            candle: candle,
            colors: allColors,
            scents: allScents,
            muErr: err,
          })
        } else{
          // Everything went fine.
          next()
        }
      })
    }), 
    
    // Validate and sanitize the name field.
    body("name", "Candle name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("description", "Candle description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("num_in_stock", "Candle number availble must be a number")
    .trim()
    .isInt({ gt: -1})
    .isInt({lt: 9001 })
    .withMessage("It can't be over 9000!") 
    .escape(),
    body("color.*")
    .escape(),
    body("scent.*")
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let muErr = [];

    // Create a candle object with escaped and trimmed data.
    const candle = new Candle({
      name: req.body.name,
      description: req.body.description,
      number_in_stock: req.body.num_in_stock,
      color: req.body.color,
      scent: req.body.scent,
      image: req.file ? req.file.filename : null,
    })
    //Check for errors
    if(!errors.isEmpty()){
      // There are errors. Render the form again with sanitized values/error messages.

      // Get all colors and scents for the form again.
      const [allColors, allScents] = await Promise.all([
        Color.find().exec(),
        Scent.find().exec(),
      ]);

      // Mark our selected colors and scents as checked.
      for (const color of allColors) {
        if (candle.color.includes(color._id)) {
          color.checked = "true";
        }
      }
      for (const scent of allScents) {
        if (candle.scent.includes(scent._id)) {
          scent.checked = "true";
        }
      }
      // Render the form again with sanitized values/error messages.
      res.render("candle_form", {
        title: "Create Candle",
        candle: candle,
        colors: allColors,
        scents: allScents,
        errors: errors.array(),
      })
    } else {
      // Data from form is valid.
      // Check if Candle with same name already exists.
      const candleExists = await Candle.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2})
        .exec()
      if(candleExists){
        // Candle exists, redirect to its details page.
        res.redirect(candleExists.url)
      } else {
        // save
        await candle.save()
        //new candle saved. Redirect to new candle detail page
        res.redirect(candle.url)
      }
    }
  })
]

// Display CANDLE DELETE  form on GET.
exports.candle_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of candle 
  const candle = await Candle.findById(req.params.id).populate("color").populate("scent").exec()

  if (candle === null){
    //no results redirect
    res.redirect("/catalog/candles")
  }
  res.render("candle_delete",{
    title: "Delete Candle",
    candle: candle,
  });
});

// Handle CANDLE DELETE on POST.
exports.candle_delete_post = asyncHandler(async (req, res, next) => {
  const password = "$uper$ecret"
  if (req.body.password === password){
    // Assume valid candle id in field and delete
    await Candle.findByIdAndDelete(req.body.candleid)
    res.redirect("/catalog/candles");
  } else {
    const error = 'Incorrect Password'
    const candle = await Candle.findById(req.params.id).exec()

    res.render("candle_delete",{
      title: "Delete Candle",
      candle: candle,
      error: error,
    })
  }
});

// Display CANDLE UPDATE form on GET.
exports.candle_update_get = asyncHandler(async (req, res, next) => {
  const [ candle, allColors, allScents ] = await Promise.all([
    Candle.findById(req.params.id).populate("color").populate("scent").exec(),
    Color.find().exec(),
    Scent.find().exec(),
  ])

  if(candle === null){
    //no results.
    const err = new Error("Candle not found")
    err.status = 404;
    return next(err);
  }
  // Mark candle's selected colors and scents as checked
  for (const color of allColors){
    for (const candle_c of candle.color) {
      if (color._id.toString() === candle_c._id.toString()) {
        color.checked = "true";
      }
    }
  }
  for (const scent of allScents){
    for (const candle_s of candle.scent) {
      if (scent._id.toString() === candle_s._id.toString()) {
        scent.checked = "true";
      }
    }
  }
  res.render("candle_form",{ 
    title: "Update Candle",
    colors: allColors,
    scents: allScents,
    candle: candle,
  });
});

// Handle CANDLE UPDATE on POST.
exports.candle_update_post = [ 
     // Convert the color to an array.
     asyncHandler(async (req, res, next) => {
      if (!(req.body.color instanceof Array)) {
        if (typeof req.body.color === "undefined") req.body.color = [];
        else req.body.color = new Array(req.body.color);
      }
      // Convert the color to an array.
      if (!(req.body.scent instanceof Array)) {
        if (typeof req.body.scent === "undefined") req.body.scent = [];
        else req.body.scent = new Array(req.body.scent);
      }
      // Handle single file upload with field name "image"
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          debug('upload error on update, MulterError:', err)
        } else if (err) {
          debug('upload error on update, UnhandledError', err)
        }
        if (err) {
          // Create a candle object with escaped and trimmed data.
        const candle = new Candle({
          name: req.body.name,
          description: req.body.description,
          number_in_stock: req.body.num_in_stock,
          color: req.body.color,
          scent: req.body.scent,
          image: req.file ? req.file.filename : null,
        })
          // Error rerender page w/ error
          const [allColors, allScents] = await Promise.all([
            Color.find().exec(),
            Scent.find().exec(),
          ]);

          // Mark our selected colors and scents as checked.
          for (const color of allColors) {
            if (candle.color.includes(color._id)) {
              color.checked = "true";
            }
          }
          for (const scent of allScents) {
            if (candle.scent.includes(scent._id)) {
              scent.checked = "true";
            }
          }
          // Render the form again with sanitized values/error messages.
          res.render("candle_form", {
            title: "Update Candle",
            candle: candle,
            colors: allColors,
            scents: allScents,
            muErr: err,
          })
        } else{
          // Everything went fine.
          next()
        }
      })
    }), 
    // Validate and sanitize the name field.
    body("name", "Candle name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("description", "Candle description must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("num_in_stock", "Candle number availble must be a number")
    .trim()
    .isInt({ gt: -1})
    .isInt({lt: 9001 })
    .withMessage("It can't be over 9000!") 
    .escape(),
    body("color.*")
    .escape(),
    body("scent.*")
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a candle object with escaped and trimmed data.
    const candle = new Candle({
      name: req.body.name,
      description: req.body.description,
      number_in_stock: req.body.num_in_stock,
      color: typeof req.body.color === "undefined" ? [] : req.body.color,
      scent: typeof req.body.scent === "undefined" ? [] : req.body.scent,
      image: req.file ? req.file.filename : null,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    })
    //Check for errors
    if(!errors.isEmpty()){
      // There are errors. Render the form again with sanitized values/error messages.

      // Get all colors and scents for the form again.
      const [allColors, allScents] = await Promise.all([
        Color.find().exec(),
        Scent.find().exec(),
      ]);

      // Mark our selected colors and scents as checked.
      for (const color of allColors) {
        if (candle.color.includes(color._id)) {
          color.checked = "true";
        }
      }
      for (const scent of allScents) {
        if (candle.scent.includes(scent._id)) {
          scent.checked = "true";
        }
      }
      // Render the form again with sanitized values/error messages.
      res.render("candle_form", {
        title: "Create Candle",
        candle: candle,
        colors: allColors,
        scents: allScents,
        errors: errors.array(),
      })
      return;
    } else {
      // Data from form is assumed to already be duplicate so process update.
      const updatedCandle = await Candle.findByIdAndUpdate(req.params.id, candle, {})
      // Redirect to candle detail page
      res.redirect(updatedCandle.url)
    }
  }),
]