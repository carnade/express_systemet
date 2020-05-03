const wineEntry = require('../models/wineEntry');
const axios = require("axios");
const cheerio = require('cheerio');
var Crawler = require("crawler");

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{

            var $ = res.$;
            let test = $('.wineFacts__factHeading--pXg1x').first().text();
            console.log(test);

            //console.log($("title").text());
        }
        done();
    }
});


module.exports.findAndUpdateVivino = async function findAndUpdateVivino(amount, callback) {
    let updated = 0;
    wineEntry.find({
        scoreVivino: null
    }, async function (error, result) {
        if (error) {
            callback(
                400, {
                    'message': error
                }
            );
        } else {
            await asyncForEach(result, async dbEntry => {
                let extra = dbEntry.nameExtra === null ? '' : '+' + dbEntry.nameExtra;
                let wine = encodeURI(dbEntry.name + extra);
                await axios.get('https://www.vivino.com/search/wines?q=' + wine)
                    .then(async function (response) {
                        // handle success'
                        let $ = cheerio.load(response.data);
                        let href = $('.wine-card__name').children().first().attr('href');
                        let rating = remove_linebreaks($(".average__number").first().text());
                        if (process.env.CONF_ENV === "DEVELOPMENT") {
                            console.log(wine +' ' + href + ' - ' + rating);
                        }
                        if (href) {
                            dbEntry.urlVivino = 'https://www.vivino.com' + href;
                        } else {
                            dbEntry.urlVivino = '-';
                        };
                        if (rating) {
                            dbEntry.scoreVivino = rating;
                        } else {
                            dbEntry.scoreVivino = '-';
                        }
                        //console.log('before ' + updated);
                        updated++;
                        await dbEntry.save()
                    })
                    .catch(function (error) {
                        // handle error
                        callback(
                            400, {
                                'message': error
                            }
                        );
                        console.log(error);
                    })
                    .finally(function () {

                    });
                await sleep(parseInt(process.env.SLEEP_TIME_MS));

            });
            await callback(
                200, {
                    'Vivino updated': updated
                }
            );
        }
    }).limit(amount);

}

module.exports.updateGrapesVivino = async function updateGrapesVivino(amount, callback) {
    let updated = 0;
    var regex = /"grapes":(\[.*?])/;
    wineEntry.find({ grapes: {$size: 0} }, async function (error, result) {
        if (error) {
            callback(
                400, {
                    'message': error
                }
            );
        } else {
            await asyncForEach(result, async dbEntry => {
                await axios.get(dbEntry.urlVivino)
                    .then(async function (response) {
                        //console.log('before ' + updated);
                        var matches = [];
                        //console.log(response.data)
                        response.data.replace(regex, function(match, arr) {
                            matches.push({
                                data: arr
                            });
                        });
                        grapes = JSON.parse(matches[0].data);
                        if (grapes.length == 0) {
                            console.log('Okänd');
                            dbEntry.grapes.push({                              
                                name: 'Okänd',
                                source: 'Vivino'
                            });
                        }
                        updated++;
                        await asyncForEach(grapes, async grape => {                            
                            await asyncForEach(grape.name.split('/'), name => {
                                console.log(dbEntry.name + ': ' + name);
                                dbEntry.grapes.push({
                                    name: name,
                                    source: 'Vivino'
                                });
                            });
                        });

                        //}
                        await dbEntry.save()
                    })
                    .catch(function (error) {
                        // handle error
                        callback(
                            400, {
                                'message': error
                            }
                        );
                        console.log(error);
                    })
                    .finally(function () {

                    });
                await sleep(parseInt(process.env.SLEEP_TIME_MS));

            });
            await callback(
                200, {
                    'Vivino grapes updated': updated
                }
            );
        }
    }).limit(amount);

}

function sleep(ms) {
    var waitUntil = new Date().getTime() + ms;
    while (new Date().getTime() < waitUntil) true;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function remove_linebreaks(str) {
    return str.replace(/[\r\n]+/gm, "");
};