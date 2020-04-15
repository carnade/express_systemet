const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
    _id: String,
    shortId: String,
    productId: String,
    name: String,
    nameExtra: String,
    category: String,
    type: String,
    price: Number,
    volume: Number,
    alcoholPercentage: Number,
    vintage: Number,
    grapes:[
        {
            name: String,
            percent: Number
        }
    ],
    isOrganic: Boolean,
    lastestPriceChange: Number,
    lastestPriceChangePercent: Number,
    lastestPriceChangeDate: Date,
    priceHistory: [
        {
            price: Number,
            priceChange: Number,
            date: Date
        }
    ],
    country: String,
    origin1: String,
    origin2: String,
    producer: String,
    sellStart: String,
    scoreVivino: String,
    urlVivino: String,
    scoreWineSearcher: String,
    urlWineSearcher: String,
    urlSystemet: String,
    outOfStock: Boolean,
    tempOutOfStock: Boolean,
    assortment: String,
    assortmentText: String
},{
    collection: process.env.COLLECTION_DEV,
    timestamps: true
});

const itemEntry = mongoose.model('ItemEntry', itemSchema);

module.exports = itemEntry;