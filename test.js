const axios = require('axios');
const {
  json
} = require('express');

async function makeGetRequest() {

  let res = await axios.get('https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?size=30&page=7&categoryLevel1=Vin&categoryLevel2=R%C3%B6tt%20vin&isEcoFriendlyPackage=false&isInDepotStockForFastDelivery=false', {
    headers: {
      'Ocp-Apim-Subscription-Key': '874f1ddde97d43f79d8a1b161a77ad31'
    }
  })

  let data = res.data;
  console.log(JSON.stringify(data));
}

makeGetRequest();