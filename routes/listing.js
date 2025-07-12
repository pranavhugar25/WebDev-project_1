const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//INDEX, CREATE ROUTE
router
  .route("/")
  .get(wrapAsync(listingControllers.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.createListing)
  );

//NEW ROUTE
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

//SHOW, UPDATE, DELETE ROUTE
router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControllers.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

//EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm)
);
module.exports = router;
