const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//INDEX ROUTE
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//NEW ROUTE
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//SHOW ROUTE
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "The listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//CREATE ROUTE
router.post(
  "/",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // if(!req.body.listing) {
    //     next(new ExpressError(400, "Send valid data for listing"));
    // }
    const newListing = new Listing(req.body.listing); //to get form details
    newListing.owner = req.user._id;
    await newListing.save(); //to save it in db
    req.flash("success", "New Listing Created Sucessfully");
    res.redirect("/listings");
  })
);

//EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "The listing you requested does not exist");
      return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//UPDATE ROUTE
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated Sucessfully");
    res.redirect(`/listings/${id}`);
  })
);

//DELETE ROUTE
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Sucessfully");
    res.redirect("/listings");
  })
);

module.exports = router;
