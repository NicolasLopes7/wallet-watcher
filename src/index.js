const Notifier = require('node-notifier');
const { positions } = require('./assets.json');
const { alerts } = require('./alerts.json');
const Promise = require('bluebird');
const axios = require('axios');

const getUSDTPrice = async () => {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=tether`
  );

  return data[0].current_price;
};

const getCurrentPriceByProvider = {
  coingecko: async (currency, quantity) => {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${currency}`
    );

    const price = data[0].current_price;
    const amount = price * quantity;

    return { price, amount };
  },
  poocoin: async (contract, quantity) => {
    const {
      data: {
        data: { symbol, price },
      },
    } = await axios.get(
      `https://api.pancakeswap.info/api/v2/tokens/${contract}`
    );

    const USDT = await getUSDTPrice();
    return { price, amount: price * quantity * USDT, symbol };
  },
};

async function getCryptoData({ currency, quantity, provider }) {
  const { price, amount, symbol } = await getCurrentPriceByProvider[provider](
    currency,
    quantity
  );

  const alert = alerts.find((alert) => alert.currency === currency);

  if (amount >= alert?.target) {
    Notifier.notify({
      title: `Tá na hora de vender seus ${currency} fi`,
      body: `Preço: ${price}\nQuanto tu tem: ${amount}`,
    });

    console.log(
      `${symbol || currency} TARGET value achieved (${alert?.target})`
    );
  }
  return `${symbol || currency}: R$ ${Number(amount.toFixed(2))}`;
}

setInterval(async () => {
  try {
    const data = await Promise.map(positions, getCryptoData, {
      concurrency: positions.length,
    });
    console.log('\n'.repeat(100));
    console.log(data.join('\n'));

    console.log(
      `Total: R$ ${data
        .reduce(
          (acc, curr) => acc + Number(curr.split(': R$ ')[1].trim()),
          3220.63 + 697.26 + 472.56
        )
        .toFixed(2)}`
    );

    console.log('\nupdated_at: ', new Date().toISOString());
  } catch (error) {
    //hehe, deu erro. nois fi
  }
}, 10000);
