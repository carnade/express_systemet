const express = require('express');
const router = express.Router();
const axios = require("axios");
const wineEntry = require('../models/wineEntry');

router.get('/all', async (req, res, next) => {
    try {
        const items = await wineEntry.find();
        res.json(items);
    } catch(error) {
        next(error);
    }
});

router.get('/reductions', (req, res) => {
    res.send('Hi there ' + req.params.id + '!')
});

router.get('/:id', (req, res) => {
    res.send('Hi there ' + req.params.id + '!')
});



router.post('/update', async (req, res) => {

    //axios
    axios.get(process.env.SYSTEMET_URL, {headers: {'Ocp-Apim-Subscription-Key':process.env.SYSTEMET_TOKEN}})
        .then(async function (response) {
            // handle success'
            let filteredData = response.data.filter(e => 
                ["Rött vin", "Vitt vin", "Mousserande vin", "Rosévin"].includes(e.SubCategory)
            ); 
            await checkAndUpdate(filteredData, function(stats) {
                res.status(201).json(stats);
            });
            //res.status(201).json({'message':'ok'});
            //console.log('#######\n' + entry);
            //var result = new Map(arr.map(i => [i.key, i.val]));
            
            //console.log(response);
            //res.status(201).json(stats);
            //res.status(201).json(entry)
        })
        .catch(function (error) {
            // handle error
            res.status(400).json({message:error})
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
    
});

router.post('/item/update/:id', (req, res) => {
});

async function checkAndUpdate(data, callback) {

    var inserted = 0;
    var updated = 0;
    var deleted = 0;

    const entries = await wineEntry.find();
    let wineMap = await new Map(entries.map(i => [i._id, i]));
    //console.log(wineMap.get(8973001));
    //console.log('IN DB: ' + entries);
    //console.log(data);
    data.forEach(async sourceEntry => {
        let dbEntry = wineMap.get(sourceEntry.ProductNumber);
        let outOfStock = sourceEntry.IsCompletelyOutOfStock;
        //console.log('oufofstock ' + outOfStock)
        if(dbEntry) {
            if (!outOfStock) {
            //console.log('FOUND: ' + sourceEntry.ProductNumber);
                let lastPriceItem = dbEntry.priceHistory[dbEntry.priceHistory.length-1];
                //console.log(lastItem);
                if (lastPriceItem && (sourceEntry.Price != lastPriceItem.price)) {
                    let priceChange = sourceEntry.Price - lastPriceItem.price;
                    dbEntry.priceHistory.push({
                        price: sourceEntry.Price,
                        priceChange: priceChange,
                        date: Date.now()
                    });
                    dbEntry.lastestPriceChange = priceChange;
                    dbEntry.lastestPriceChangePercent =  priceChange / lastPriceItem.price;
                    dbEntry.lastestPriceChangeDate = Date.now();
                    //console.log('FOUND: ' + dbEntry);       
                    updated++;
                    await dbEntry.save();
                    
                };                
            } else {
                //console.log('DELETING entry ' + dbEntry.ProductNumber)
                deleted++;
                await dbEntry.delete();
                
            }  
        } else if (!outOfStock){
            const newEntry = createNewEntry(sourceEntry);
            //console.log('NOT FOUND: ' + sourceEntry.ProductNumber);
            inserted++;
            await newEntry.save();           
        };
        //console.log('inside: i=' + inserted + ' u=' + updated + ' d=' + deleted);
    });
    //find correct entry
    //update entry if price change
        //create reduction if price reduced??
    //else
    //console.log('outside: i=' + inserted + ' u=' + updated + ' d=' + deleted);
    callback({
        'inserted': inserted,
        'updated': updated,
        'deleted': deleted
    });
}

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
                date: Date.now()
            }
        ]
    });

    return newEntry;
}

module.exports = router;