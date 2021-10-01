const { positions } = require('./assets.json');
const axios = require('axios');
const Promise = require('bluebird');

async function getCryptoData({ currency, amount }) {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${currency}`
  );

  const price = data[0].current_price;

  return `${currency}: R$ ${Number((price * amount).toFixed(2))}`;
}

setInterval(async () => {
  const data = await Promise.map(positions, getCryptoData, {
    concurrency: positions.length,
  });

  console.log('\n'.repeat(100));
  console.log(data.join('\n'));

  console.log(
    `Total: R$ ${data
      .reduce((acc, curr) => acc + Number(curr.split(': R$ ')[1].trim()), 0)
      .toFixed(2)}`
  );

  console.log('\nupdated_at: ', new Date().toISOString());
}, 10000);
