const Scent = require("../models/scent")
const Candle = require("../models/candle")

// npm install express-async-handler  
// to get asyncHandler in order to catch exceptions in routers
const asyncHandler = require("express-async-handler");
// npm install express-validator
// to get input validator for express 
const { body, validationResult } = require("express-validator");


// Display list of all Scents.
exports.scent_list = asyncHandler(async (req, res, next) => {
  const allScents = await Scent.find({}, "name")
    .sort({ name: 1 })
    .exec()

  res.render("scent_list", { title: "Scent List", scent_list: allScents });
});

// Display detail page for a specific scent.
exports.scent_detail = asyncHandler(async (req, res, next) => {
  const scent = await Scent.findById(req.params.id)
  .exec()

  if (scent === null) {
    // No results.
    const err = new Error("Scent not found");
    err.status = 404;
    return next(err);
  }

  res.render("scent_detail", {
    scent: scent,
  })

});

// Display scent create form on GET.
exports.scent_create_get = asyncHandler(async (req, res, next) => {
  res.render("scent_form",{title: "Create Scent",});
});

// Handle scent create on POST.
exports.scent_create_post = [ 
 // Validate and sanitize the name and description field.
  body("name","Scent Name must contain at least 3 characters.")
    .trim()
    .isLength({ min: 3})
    .escape(),
  body("description","Scent description must contain more than 1 character.")
    .trim()
    .isLength({ min: 1})
    .escape(),

  // Process request after validation and sanitization. 
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a scent object with escaped and trimmed data.
    const scent = new Scent({
      name: req.body.name,
      description: req.body.description,
    })

    // Check for errors from validation
    if(!errors.isEmpty()){
      // There are errors. Render form again with sanitized values/error messages.
      res.render("scent_form", {
        title: "Create Scent",
        name: scent.name,
        description: scent.description,
        errors: errors.array(),
      })
    } else {
      // Data from form is valid.
      // Check if Scent with same name already exists.
      const scentExists = await Scent.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();  
      if(scentExists){
        // Same name Scent exists, redirect to its detail page.
        res.redirect(scentExists.url)
      } else {
        await scent.save()
        // New scent saved. Redirect to scent detail page.
        res.redirect(scent.url)
      }
    } 
  }),
]

// Display scent delete form on GET.
exports.scent_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of scent and all their candles (in parallel)
  const [scent, allCandlesInScent] = await Promise.all([
    Scent.findById(req.params.id).exec(),
    Candle.find({ scent: req.params.id }, "name description number_in_stock").exec(),
  ]);
  if (scent === null) {
    // no results.
    res.redirect("/catalog/scents")
  }
  res.render("scent_delete", {
    title: "Delete Scent",
    scent: scent,
    scent_candles: allCandlesInScent,
  });
});

// Handle scent delete on POST.
exports.scent_delete_post = asyncHandler(async (req, res, next) => {
  const password = "$uper$ecret";
  // Get details of scent and all their candles (in parallel)
  const [scent, allCandlesInScent] = await Promise.all([
    Scent.findById(req.params.id).exec(),
    Candle.find({ scent: req.params.id }, "name description number_in_stock").exec(),
  ]);
  
  if(allCandlesInScent > 0) {
    // Scent has candles. Render in same way as GET route. 
    res.render("scent_delete", {
      title: "Delete Scent",
      scent: scent,
      scent_candles: allCandlesInScent,
    })
    return;
  } else {
    if (req.body.password === password){
      // Assume valid scent id in field and delete
      await Scent.findByIdAndDelete(req.body.scentid)
      res.redirect("/catalog/scents");
    } else {
      const error = 'Incorrect Password'
      res.render("scent_delete",{
        title: "Delete scent",
        scent: scent,
        scent_candles: allCandlesInScent,
        error: error,
      })
    }
  }
});

// Display scent update form on GET.
exports.scent_update_get = asyncHandler(async (req, res, next) => {
  // Get scent for form
  const scent = await Scent.findById(req.params.id).exec()
  //if no form
  if(scent === null) {
    // No results.
    const err = new Error("Scent not found");
    err.status = 404;
    return next(err);
  }

  //render update form
  res.render("scent_form", {
    title: "Update Scent",
    scent: scent,
  })
});

// Handle scent update on POST.
exports.scent_update_post = [ 
  // Validate and sanitize the name and description field.
   body("name","Scent Name must contain at least 3 characters.")
     .trim()
     .isLength({ min: 3})
     .escape(),
   body("description","Scent description must contain more than 1 character.")
     .trim()
     .isLength({ min: 1})
     .escape(),
 
   // Process request after validation and sanitization. 
   asyncHandler(async (req, res, next) => {
     // Extract the validation errors from a request.
     const errors = validationResult(req);
 
     // Create a scent object with escaped and trimmed data.
     const scent = new Scent({
       name: req.body.name,
       description: req.body.description,
       _id: req.params.id,
     })
 
     // Check for errors from validation
     if(!errors.isEmpty()){
       // There are errors. Render form again with sanitized values/error messages.
       res.render("scent_form", {
         title: "Update Scent",
         scent: scent,
         errors: errors.array(),
       })
     } else {
        const updatedScent = await Scent.findByIdAndUpdate(req.params.id, scent)
         // New scent saved. Redirect to scent detail page.
         res.redirect(updatedScent.url)
       } 
   }),
 ]