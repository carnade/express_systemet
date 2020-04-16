const wineEntry = require('../models/wineEntry');
const axios = require("axios");
const cheerio = require('cheerio');

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
                console.log(wine);
                await axios.get('https://www.vivino.com/search/wines?q=' + wine)
                    .then(async function (response) {
                        // handle success'
                        let $ = cheerio.load(response.data);
                        let href = $('.wine-card__name').children().first().attr('href');
                        let rating = remove_linebreaks($(".average__number").first().text());
                        console.log(href + ' - ' + rating);

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