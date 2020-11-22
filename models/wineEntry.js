const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

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
    grapes: [{
        name: String,
        percent: Number,
        source: String
    }],
    isOrganic: Boolean,
    isEthical: Boolean,
    lastestPriceChange: Number,
    lastestPriceChangePercent: Number,
    lastestPriceChangeDate: Date,
    priceHistory: [{
        price: Number,
        priceChange: Number,
        date: Date
    }],
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
    assortmentText: String,
    tasteClockFruitacid: Number,
    tasteClockBody: Number,
    tasteClockRoughness: Number,
    sugarContent: Number,
    imageUrl: String,
    isDiscontinued: Boolean,
    isSupplierTemporaryNotAvailable: Boolean,
    isRegionalRestricted: Boolean,
    isNews: Boolean,
    isWebLaunch: Boolean

}, {
    collection: process.env.COLLECTION,
    timestamps: true
});

const itemEntry = mongoose.model('ItemEntry', itemSchema);

module.exports = itemEntry;