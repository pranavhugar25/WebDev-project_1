const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://thumbs.dreamstime.com/z/mobile-191030798.jpg?ct=jpeg",
        set: (v) => v === "" ? "https://thumbs.dreamstime.com/z/mobile-191030798.jpg?ct=jpeg":v,
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;