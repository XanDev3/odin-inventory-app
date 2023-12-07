const Color = require("../models/color")
const Candle = require("../models/candle")

// npm install express-async-handler  
// to get asyncHandler in order to catch exceptions in routers
const asyncHandler = require("express-async-handler");
// npm install express-validator
// to get input validator for express 
const { body, validationResult } = require("express-validator");

// Display list of all Colors.
exports.color_list = asyncHandler(async (req, res, next) => {
  // Get details of color, colors, and scent counts (in parallel)
  const allColors = await Color.find({})
  .sort({name:1})
  .exec()

  res.render("color_list", { 
    title: "Color List", 
    color_list: allColors, 
});
});

// Display DETAIL PAGE for a specific color.
exports.color_detail = asyncHandler(async (req, res, next) => {
  const color = await Color.findById(req.params.id)
  .exec()

  if (color === null) {
    // No results.
    const err = new Error("Color not found");
    err.status = 404;
    return next(err);
  }

  res.render("color_detail", {
    color: color,
  })
});

// Display color create form on GET.
exports.color_create_get = asyncHandler(async (req, res, next) => {
  res.render("color_form", {
    title: "Create Color",
    });
});

// Handle color create on POST.
exports.color_create_post = [
   // Validate and sanitize the name field.
  body("name", "Candle name must contain at least 3 charcters")
    .trim()
    .isLength({ min: 3})
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

 // Process request after validation and sanitization. 
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a color object with escaped and trimmed data.
    const color = new Color({ 
      name: req.body.name, 
      description: req.body.description 
    });
    // Check for errors from validation
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("color_form", {
        title: "Create Color",
        name: color.name,
        description: color.description,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Color with same name already exists.
      const colorExists = await Color.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec()
      if (colorExists) {
        // Same name Color exists, redirect to its detail page.
        res.redirect(colorExists.url);
      } else {
        await color.save()
        // New color saved. Redirect to color detail page.
        res.redirect(color.url)
      }
    }
  })
]

// Display color delete form on GET.
exports.color_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of color and all their candles (in parallel)
  const [color, allCandlesInColor] = await Promise.all([
    Color.findById(req.params.id).exec(),
    Candle.find({ color: req.params.id }, "name description number_in_stock").exec(),
  ]);
  if (color === null) {
    // no results.
    res.redirect("/catalog/colors")
  }
  res.render("color_delete", {
    title: "Delete Color",
    color: color,
    color_candles: allCandlesInColor,
  });
});

// Handle color delete on POST.
exports.color_delete_post = asyncHandler(async (req, res, next) => {
  const password = "$uper$ecret"
  const [color, allCandlesInColor] = await Promise.all([
    Color.findById(req.params.id).exec(),
    Candle.find({ color: req.params.id }, "name description number_in_stock").exec(),
  ]);
  if (allCandlesInColor.length > 0) {
    // Color has candles. Render in same way as GET route. 
    res.render("color_delete", {
      title: "Delete Color",
      color: color,
      color_candles: allCandlesInColor,
    })
    return;
  } else {
    if (req.body.password === password){
      // Assume valid color id in field and delete
      await Color.findByIdAndDelete(req.body.colorid)
      res.redirect("/catalog/colors");
    } else {
      const error = 'Incorrect Password'
      res.render("color_delete", {
        title: "Delete color",
        color: color,
        color_candles: allCandlesInColor,
        error: error,
      })
    }
  }
});

// Display color update form on GET.
exports.color_update_get = asyncHandler(async (req, res, next) => {
  // Get color for form
  const color = await Color.findById(req.params.id).exec()

  if (color === null) {
    // No results.
    const err = new Error("Color not found");
    err.status = 404;
    return next(err);
  }
  res.render("color_form", {
    title: "Update Color",
    color: color,
  })
});

// Handle color update on POST.
exports.color_update_post = [
  // Validate and sanitize the name field.
  body("name", "Candle name must contain at least 3 charcters")
    .trim()
    .isLength({ min: 3})
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

 // Process request after validation and sanitization. 
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a color object with escaped and trimmed data.
    const color = new Color({ 
      name: req.body.name, 
      description: req.body.description,
      _id: req.params.id, 
    });
    // Check for errors from validation
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("color_form", {
        title: "Update Color",
        name: color.name,
        description: color.description,
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Color with same name already exists.
      const colorExists = await Color.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec()
      if (colorExists) {
        // Same name Color exists, redirect to its detail page.
        res.redirect(colorExists.url);
      } else {
        const updatedColor = await Color.findByIdAndUpdate(req.params.id, color);
        // New color saved. Redirect to color detail page
        res.redirect(updatedColor.url)
      }
    }
  })
]