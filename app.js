const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { STATUS_CODES } = require("http");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//validation function for joi
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.send("hi, im root");
});

// app.get("/testListing", async (req,res) => {
//     let samplelisting = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("testing was sucessful");
// });

//INDEX ROUTE
app.get(
  "/listing",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//NEW ROUTE
app.get("/listing/new", (req, res) => {
  res.render("listings/new.ejs");
});

//SHOW ROUTE
app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//CREATE ROUTE
app.post(
  "/listing",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // if(!req.body.listing) {
    //     next(new ExpressError(400, "Send valid data for listing"));
    // }
    const newListing = new Listing(req.body.listing); //to get form details
    await newListing.save(); //to save it in db
    res.redirect("/listing");
  })
);

//EDIT ROUTE
app.get(
  "/listing/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//UPDATE ROUTE
app.put(
  "/listing/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listing/${id}`);
  })
);

//DELETE ROUTE
app.delete(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
  })
);

//REVIEWS
//POST REVIEW ROUTE
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(newReview);
    // console.log(listing);
    listing.reviews.push(newReview);

    await listing.save();
    await newReview.save();

    res.redirect(`/listing/${listing._id}`);
  })
);

//DELETE REVIEW ROUTE
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Some random ERROR" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("listening to the port 8080");
});
