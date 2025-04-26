const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to db");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);    
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

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
app.get("/listing", async (req,res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});

//NEW ROUTE
app.get("/listing/new", (req, res) => {
    res.render("listings/new.ejs");
});

//SHOW ROUTE
app.get("/listing/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

//CREATE ROUTE
app.post("/listing", async (req, res) => {
    const newListing = new Listing(req.body.listing); //to get form details
    await newListing.save(); //to save it in db
    res.redirect("/listing");
});

//EDIT ROUTE
app.get("/listing/:id/edit", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing});
});

//UPDATE ROUTE
app.put("/listing/:id", async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listing/${id}`);
});

//DELETE ROUTE
app.delete("/listing/:id", async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
})



app.listen(8080, () => {
    console.log("listening to the port 8080");
});