const Notifier = require('node-notifier');
const { positions } = require('./assets.json');
const { alerts } = require('./alerts.json');
const Promise = require('bluebird');
const axios = require('axios');

async function getCryptoData({ currency, quantity }) {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${currency}`
  );

  const price = data[0].current_price;
  const amount = price * quantity;

  const alert = alerts.find((alert) => alert.currency === currency);

  const defaultTitle = `Tá na hora de vender seus ${currency} fi`;
  const defaultBody = `Preço: ${price}\nQuanto tu tem: ${amount}`;

  if (amount >= alert?.targetMAX) {
    Notifier.notify({
      title: defaultTitle,
      body: `++ Em alta. ${defaultBody}`,
    });
  } else if (amount <= alert?.targetMIN) {
    Notifier.notify({
      title: defaultTitle,
      body: `-- Em queda. ${defaultBody}`,
    });
  }

  return `${currency}: R$ ${Number(amount.toFixed(2))}`;
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
