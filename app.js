const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");

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
app.set("views", path.join(__dirname,"views"))

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

app.listen(8080, () => {
    console.log("listening to the port 8080");
});