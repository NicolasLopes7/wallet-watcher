import axios from 'axios';
import Promise from 'bluebird';
import { useEffect, useState } from 'react';
import { positions } from './assets.json';
import './index.css';
function App() {
  const [batata, setBatata] = useState([]);
  async function getCryptoData({ currency, quantity }) {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${currency}`
    );

    const price = data[0].current_price;
    const amount = price * quantity;

    return `${currency}: R$ ${Number(amount.toFixed(2))}`;
  }

  useEffect(() => {
    setInterval(async () => {
      const data = await Promise.map(positions, getCryptoData, {
        concurrency: positions.length,
      });

      setBatata(data);
    }, 10000);
  }, []);
  return (
    <div className="App">
      <table>
        <thead>
          <th>Nome da moeda</th>
          <th>Valor</th>
        </thead>
        <tbody>
          {batata.map((a) => (
            <tr>
              <td>{a.split(': ')[0]}</td>
              <td>{a.split(': ')[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
