const express = require('express');
const router = express.Router();
const axios = require("axios");
const wineEntry = require('../models/wineEntry');
const fetchSystemetSvc = require('../services/fetchSystemetSvc');
const fetchSystemetScrapeSvc = require('../services/fetchSystemetScrapeSvc');
const fetchVivinoSvc = require('../services/fetchVivinoSvc');

router.get('/wines', async (req, res, next) => {
    try {
        const items = await wineEntry.find();
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

router.get('/wines/reductions', (req, res) => {
    res.send('Hi there ' + req.params.id + '!')
});

router.get('/:id', (req, res) => {
    res.send('Hi there ' + req.params.id + '!')
});

router.post('/update/vivino/', (req, res) => {

    fetchVivinoSvc.findAndUpdateVivino(parseInt(process.env.VIVINO_FETCH_AMOUNT), async function (status, stats) {
        await res.status(status).json(stats);
    });
});

router.post('/update/vivino/grapes', (req, res) => {

    fetchVivinoSvc.updateGrapesVivino(parseInt(process.env.VIVINO_FETCH_AMOUNT), async function (status, stats) {
        await res.status(status).json(stats);
    });
});



router.post('/update/list', async (req, res) => {

    //axios
    axios.get(process.env.SYSTEMET_URL, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.SYSTEMET_TOKEN
            }
        })
        .then(async function (response) {
            // handle success'
            let filteredData = response.data.filter(e => ["Rött vin", "Vitt vin", "Mousserande vin", "Rosévin"].includes(e.SubCategory));
            await fetchSystemetSvc.checkAndUpdate(filteredData, function (stats) {
                res.status(201).json(stats);
            });
        })
        .catch(function (error) {
            // handle error
            res.status(400).json({
                message: error
            })
            console.log(error);
        })
        .finally(function () {
            // always executed
        });

});

router.get('/test/list', async (req, res) => {

    //axios
    //    axios.get('https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?size=30&page=7&categoryLevel1=Vin&categoryLevel2=R%C3%B6tt%20vin&isEcoFriendlyPackage=false&isInDepotStockForFastDelivery=false', {
    axios.get('http://localhost:3000/data', {
            headers: {
                'Ocp-Apim-Subscription-Key': '874f1ddde97d43f79d8a1b161a77ad31'
            }
        })
        .then(async function (response) {
            // handle success'
            await fetchSystemetScrapeSvc.checkAndUpdate(response.data, function (stats) {
                console.log("await response");
                res.status(201).json(stats);
            });

        })
        .catch(function (error) {
            // handle error
            res.status(400).json({
                message: error
            })
            console.log(error);
        })
        .finally(function () {
            // always executed
        });

});

router.post('/item/update/:id', (req, res) => {});


module.exports = router;