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
    axios.get("http://localhost:3000/data", {headers: {'Ocp-Apim-Subscription-Key':process.env.SYSTEMET_TOKEN}})
        .then(async function (response) {
            // handle success'
            let filteredData = response.data.filter(e => 
                ["Rött vin", "Vitt vin", "Mousserande vin", "Rosévin"].includes(e.SubCategory)
            ); 
            let entry = await checkAndUpdate(filteredData);
            //console.log('#######\n' + entry);
            //var result = new Map(arr.map(i => [i.key, i.val]));
            
            //console.log(response);
            //res.status(201).json({message: "Done! Added " + filteredData.length + " items."})
            res.status(201).json(entry)
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

async function checkAndUpdate(data) {

    const entries = await wineEntry.find();
    let wineMap = await new Map(entries.map(i => [i._id, i]));
    //console.log(wineMap.get(8973001));
    //console.log('IN DB: ' + entries);
    //console.log(data);
    data.forEach(sourceEntry => {
        if(wineMap.get(sourceEntry.ProductNumber)) {
            console.log('FOUND: ' + sourceEntry.ProductNumber);
        } else {
            const newEntry = createNewEntry(sourceEntry);
            console.log('NOT FOUND: ' + sourceEntry.ProductNumber)
            newEntry.save();
        }

    })


    //find correct entry
    //update entry if price change
        //create reduction if price reduced??
    //else
    return entries;
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
        Producer: entry.ProducerName,
        sellStart: entry.SellStartDate,
        outOfStock: entry.IsCompletelyOutOfStock,
        tempOutOfStock: entry.IsTemporaryOutOfStock,
        assortment: entry.Assortment,
        assortmentText: entry.AssortmentText
    });

    return newEntry;
}

module.exports = router;