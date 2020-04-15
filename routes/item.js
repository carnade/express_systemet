const express = require('express');
const router = express.Router();
const axios = require("axios");
const wineEntry = require('../models/wineEntry');
const fetchSystemetSvc = require('../services/fetchSystemetService');
const cheerio = require('cheerio');

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

router.post('/update/vivino/', async (req, res) => {

    let updated = 0;

    await wineEntry.find({ scoreVivino: null }, async function(err, result) {
        if (err) {
            res.send(err);
        } else {
            result.forEach(async dbEntry => {
                let extra = dbEntry.nameExtra===null?'':'+'+dbEntry.nameExtra;
                let wine = encodeURI(dbEntry.name + extra);
                console.log(wine);
                await axios.get('https://www.vivino.com/search/wines?q=' + wine)
                    .then( async function (response) {
                        // handle success'
                        let $ = cheerio.load(response.data);
                        let href = $('.wine-card__name').children().first().attr('href');
                        let rating = remove_linebreaks($(".average__number").first().text());
                        console.log(href + ' - ' + rating);
                        updated++;
                        if (href) {
                            dbEntry.urlVivino='https://www.vivino.com' + href;
                        } else {
                            dbEntry.urlVivino='-';
                        };
                        if (rating){
                            dbEntry.scoreVivino=rating;
                        }else {
                            dbEntry.scoreVivino='-';
                        }
                        await dbEntry.save()
                    })
                    .catch(function (error) {
                        // handle error
                        res.status(400).json({message:error})
                        console.log(error);
                    })
                    .finally(function () {
                        
                    }); 
                    await sleep(4);
            }); 
            await res.status(200).json({message: 'Updated: ' + updated + ' Vivino ratings!'});    
        }      
        
    })
    .limit(20);   
});

router.post('/update/list', async (req, res) => {

    //axios
    axios.get(process.env.SYSTEMET_URL, {headers: {'Ocp-Apim-Subscription-Key':process.env.SYSTEMET_TOKEN}})
        .then(async function (response) {
            // handle success'
            let filteredData = response.data.filter(e => 
                ["Rött vin", "Vitt vin", "Mousserande vin", "Rosévin"].includes(e.SubCategory)
            ); 
            await fetchSystemetSvc.checkAndUpdate(filteredData, function(stats) {
                res.status(201).json(stats);
            });
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

function remove_linebreaks(str) { 
	return str.replace( /[\r\n]+/gm, "" ); 
};

function sleep(seconds){
    var waitUntil = new Date().getTime() + seconds*1000;
    while(new Date().getTime() < waitUntil) true;
}

module.exports = router;