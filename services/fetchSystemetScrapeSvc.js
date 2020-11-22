const wineEntry = require("../models/wineEntry");

module.exports.checkAndUpdate = async function checkAndUpdate(data, callback) {
    var inserted = 0;
    var updatedPrice = 0;
    var updatedData = 0;
    var deleted = 0;

    const entries = await wineEntry.find();
    let wineMap = await new Map(entries.map((i) => [i._id, i]));

    data.products.forEach(async (sourceEntry) => {

        let updateEntry = false;
        let isDataUpdated = false;
        let dbEntry = wineMap.get(sourceEntry.productNumber);
        let outOfStock = sourceEntry.isCompletelyOutOfStock;
        if (dbEntry) {
            if (dbEntry.isDiscontinued == null) { //One time migrations
                dbEntry.sugarContent = sourceEntry.sugarContent;

                dbEntry.tasteClockFruitacid = sourceEntry.tasteClockFruitacid;
                dbEntry.tasteClockBody = sourceEntry.tasteClockBody;
                dbEntry.tasteClockRoughness = sourceEntry.tasteClockRoughness;
                dbEntry.sugarContent = sourceEntry.sugarContent;
                dbEntry.imageUrl = sourceEntry.images[0].imageUrl;
                dbEntry.isDiscontinued = sourceEntry.isDiscontinued;
                dbEntry.isSupplierTemporaryNotAvailable = sourceEntry.isSupplierTemporaryNotAvailable;
                dbEntry.isRegionalRestricted = sourceEntry.isRegionalRestricted;
                dbEntry.isNews = sourceEntry.isNews;
                dbEntry.isWebLaunch = sourceEntry.isWebLaunch;
                dbEntry.isEthical = sourceEntry.isEthical;
                if (sourceEntry.grapes.length > 0) {
                    sourceEntry.grapes.forEach(grape => {
                        dbEntry.grapes.push({
                            name: grape,
                            source: "Systembolaget"
                        });
                    })
                }
            }
            if (!outOfStock) {
                let lastPriceItem =
                    dbEntry.priceHistory[dbEntry.priceHistory.length - 1];
                console.log("nr: " + sourceEntry.productNumber + " old: " + lastPriceItem.price + " new: " + sourceEntry.price)
                if (lastPriceItem && sourceEntry.price != lastPriceItem.price) {
                    let priceChange = sourceEntry.price - lastPriceItem.price;
                    dbEntry.priceHistory.push({
                        price: sourceEntry.price,
                        priceChange: priceChange,
                        date: Date.now(),
                    });
                    dbEntry.lastestPriceChange = priceChange;
                    dbEntry.lastestPriceChangePercent = priceChange / lastPriceItem.price;
                    dbEntry.lastestPriceChangeDate = Date.now();
                    dbEntry.price = sourceEntry.price;

                    updatedPrice++;
                    updateEntry = true;
                }
                if (dbEntry.isNews != sourceEntry.isNews) {
                    dbEntry.isNews = sourceEntry.isNews;
                    if (!isDataUpdated) {
                        updatedData++;
                        isDataUpdated = true;
                        updateEntry = true;
                    }
                }
                if (dbEntry.isSupplierTemporaryNotAvailable != sourceEntry.isSupplierTemporaryNotAvailable) {
                    dbEntry.isSupplierTemporaryNotAvailable = sourceEntry.isSupplierTemporaryNotAvailable;
                    if (!isDataUpdated) {
                        updatedData++;
                        isDataUpdated = true;
                        updateEntry = true;
                    }
                }
                if (dbEntry.isDiscontinued != sourceEntry.isDiscontinued) {
                    dbEntry.isDiscontinued = sourceEntry.isDiscontinued;
                    if (!isDataUpdated) {
                        updatedData++;
                        isDataUpdated = true;
                        updateEntry = true;
                    }
                }
                if (dbEntry.tempOutOfStock != sourceEntry.tempOutOfStock) {
                    dbEntry.tempOutOfStock = sourceEntry.tempOutOfStock;
                    if (!isDataUpdated) {
                        updatedData++;
                        isDataUpdated = true;
                        updateEntry = true;
                    }
                }
            } else {
                if (dbEntry.outOfStock != outOfStock) {
                    deleted++;
                    updateEntry = true;
                }
                dbEntry.outOfStock = outOfStock;
            }
            if (updateEntry) {
                console.log("save update");
                await dbEntry.save();
            }
        } else if (!outOfStock) {
            const newEntry = createNewEntry(sourceEntry);
            inserted++;
            console.log("save new entry");
            await newEntry.save();
        }
    });
    callback({
        inserted: inserted,
        updatedPrice: updatedPrice,
        updateData: updatedData,
        outOfStock: deleted,
    });
};

function createNewEntry(entry) {
    let newEntry = new wineEntry({
        _id: entry.productNumber,
        shortId: entry.productNumberShort,
        productId: entry.productId,
        name: entry.productNameBold,
        nameExtra: entry.productNameThin,
        category: entry.subCategory,
        type: entry.type,
        price: entry.price,
        volume: entry.volume,
        alcoholPercentage: entry.alcoholPercentage,
        vintage: entry.vintage,
        isOrganic: entry.isOrganic,
        country: entry.country,
        origin1: entry.originLevel1,
        origin2: entry.originLevel2,
        producer: entry.producerName,
        sellStart: entry.pellStartDate,
        outOfStock: entry.isCompletelyOutOfStock,
        tempOutOfStock: entry.isTemporaryOutOfStock,
        assortment: entry.assortment,
        assortmentText: entry.assortmentText,
        priceHistory: [{
            price: entry.price,
            priceChange: 0,
            date: Date.now(),
        }, ],
        lastestPriceChange: null,
        lastestPriceChangePercent: null,
        lastestPriceChangeDate: null,
        scoreVivino: null,
        urlVivino: null,
        scoreWineSearcher: null,
        urlWineSearcher: null,
        urlSystemet: null,
        isEthical: entry.isEthical,
        tasteClockFruitacid: entry.tasteClockFruitacid,
        tasteClockBody: entry.tasteClockBody,
        tasteClockRoughness: entry.tasteClockRoughness,
        sugarContent: entry.sugarContent,
        imageUrl: entry.images[0].imageUrl,
        isDiscontinued: entry.isDiscontinued,
        isSupplierTemporaryNotAvailable: entry.isSupplierTemporaryNotAvailable,
        isRegionalRestricted: entry.isRegionalRestricted,
        isNews: entry.isNews,
        isWebLaunch: entry.isWebLaunch

    });

    if (entry.grapes.length > 0) {
        entry.grapes.forEach(grape => {
            newEntry.grapes.push({
                name: grape,
                source: "Systembolaget"
            });
        })
    }

    console.log(newEntry)

    return newEntry;
}