const wineEntry = require("../models/wineEntry");

module.exports.checkAndUpdate = async function checkAndUpdate(data, callback) {
  var inserted = 0;
  var updated = 0;
  var deleted = 0;

  const entries = await wineEntry.find();
  let wineMap = await new Map(entries.map((i) => [i._id, i]));
  data.forEach(async (sourceEntry) => {
    let dbEntry = wineMap.get(sourceEntry.ProductNumber);
    let outOfStock = sourceEntry.IsCompletelyOutOfStock;

    if (dbEntry) {
      if (!outOfStock) {
        let lastPriceItem =
          dbEntry.priceHistory[dbEntry.priceHistory.length - 1];

        if (lastPriceItem && sourceEntry.Price != lastPriceItem.price) {
          let priceChange = sourceEntry.Price - lastPriceItem.price;
          dbEntry.priceHistory.push({
            price: sourceEntry.Price,
            priceChange: priceChange,
            date: Date.now(),
          });
          dbEntry.lastestPriceChange = priceChange;
          dbEntry.lastestPriceChangePercent = priceChange / lastPriceItem.price;
          dbEntry.lastestPriceChangeDate = Date.now();

          updated++;
          await dbEntry.save();
        }
      } else {
        if (dbEntry.outOfStock != outOfStock) {
          deleted++;
        }
        dbEntry.outOfStock = outOfStock;

        await dbEntry.save();
      }
    } else if (!outOfStock) {
      const newEntry = createNewEntry(sourceEntry);
      inserted++;
      await newEntry.save();
    }
  });
  callback({
    inserted: inserted,
    updated: updated,
    outOfStock: deleted,
  });
};

function createNewEntry(entry) {
  let newEntry = new wineEntry({
    _id: entry.ProductNumber,
    shortId: entry.ProductNumberShort,
    productId: entry.ProductId,
    name: entry.ProductNameBold,
    nameExtra: entry.ProductNameThin,
    category: entry.SubCategory,
    type: entry.Type,
    price: entry.Price,
    volume: entry.Volume,
    alcoholPercentage: entry.AlcoholPercentage,
    vintage: entry.Vintage,
    isOrganic: entry.IsOrganic,
    country: entry.Country,
    origin1: entry.OriginLevel1,
    origin2: entry.OriginLevel2,
    producer: entry.ProducerName,
    sellStart: entry.SellStartDate,
    outOfStock: entry.IsCompletelyOutOfStock,
    tempOutOfStock: entry.IsTemporaryOutOfStock,
    assortment: entry.Assortment,
    assortmentText: entry.AssortmentText,
    priceHistory: [
      {
        price: entry.Price,
        priceChange: 0,
        date: Date.now(),
      },
    ],
    lastestPriceChange: null,
    lastestPriceChangePercent: null,
    lastestPriceChangeDate: null,
    scoreVivino: null,
    urlVivino: null,
    scoreWineSearcher: null,
    urlWineSearcher: null,
    urlSystemet: null,
  });

  return newEntry;
}
