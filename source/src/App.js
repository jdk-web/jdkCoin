import { useQuery } from '@tanstack/react-query';
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';

function App() {
  let [coin,setCoin] = useState([]);
  let [coinPrice, setCoinPrice] = useState([])
  let [sort, setSort] = useState('-');
  
  /* GET COIN DATA */
  useEffect(()=>{
    axios
    .request({
      method: 'GET',
      url: 'https://api.upbit.com/v1/market/all?isDetails=false',
      headers: {accept: 'application/json'}
    })
    .then(function (response) {
      let array = response.data;
      /* COIN KRW SORTING */
      let market = array.map((row,idx)=>{ if( row.market.indexOf('KRW') !== -1) { return row } });
      market      = market.filter(function(item) {return item !== null && item !== undefined && item !== '';});
      setCoin(market);
    })
    .catch(function (error) {
      console.error(error);
    });
  },[]) 

  /* COIN PARAM */
  let market_param = coin.map((row,idx)=>{ return row.market });
  market_param = market_param.join(",")
  
/* GET COIN PRICE INFO */
useQuery([], ()=>
  axios
  .request({
    method: 'GET',
    url: 'https://api.upbit.com/v1/ticker',
    headers: {accept: 'application/json'},
    params :{'markets':market_param}
  })
  .then(function (response) {
    let data = coin.map((item, i) => Object.assign({}, item, response.data[i]));
    setCoinPrice(data);
    return data;
  })
  .catch(function (error) {
   // console.error(error);
  }),
  {refetchInterval:500}
)
//🔽
  return (
    <div className="App" style={{marginTop:'185px', marginLeft:'50px', marginRight:'50px'}}>
      <span>암호화폐 총 개수 : {coinPrice.length} 개</span> 
        <Table striped bordered hover variant="dark" style={{margin:'auto'}}>
        <thead>
          <tr>
            <th>Market(원화)</th>
            <th>
              이름
              <span className="sort"
                onClick={(e)=>{
                  if(e.target.innerText==='🔽'){
                    let Price = coinPrice.sort((a,b) => (a.korean_name > b.korean_name) ? 1 : ((b.korean_name > a.korean_name) ? -1 : 0));       
                    let tmp = Price.map((row,idx)=>{ return row });    
                    setCoin(tmp)
                    sortInit();
                    e.target.innerText = '🔼'
                  }else{
                    let Price = coinPrice.sort((a,b) =>  (a.korean_name > b.korean_name) ? -1 : ((b.korean_name > a.korean_name) ? 1 : 0));       
                    let tmp = Price.map((row,idx)=>{ return row });    
                    setCoin(tmp)
                    sortInit();
                    e.target.innerText = '🔽'
                  }
                  
                }}
              >
                  -
              </span>

            </th>
            <th>현재가
              <span className="sort"
                onClick={(e)=>{
                  if(e.target.innerText==='🔽'){
                    let Price = coinPrice.sort((a,b) => (a.trade_price - b.trade_price));       
                    let tmp = Price.map((row,idx)=>{ return row });    
                    setCoin(tmp)
                    sortInit();
                    e.target.innerText = '🔼'
                  }else{
                    let Price = coinPrice.sort((a,b) => (b.trade_price - a.trade_price));       
                    let tmp = Price.map((row,idx)=>{ return row });    
                    setCoin(tmp)
                    sortInit();
                    e.target.innerText = '🔽'
                  }
                }}
              >
                  -
              </span> 
            </th>
            <th>전일대비
              <span className="sort"
                  onClick={(e)=>{
                    if(e.target.innerText==='🔽'){
                      let Rate = coinPrice.sort((a,b) => (a.signed_change_rate - b.signed_change_rate));       
                      let tmp = Rate.map((row,idx)=>{ return row });    
                      setCoin(tmp)
                      sortInit();
                      e.target.innerText = '🔼'
                    }else{
                      let Rate = coinPrice.sort((a,b) => (b.signed_change_rate - a.signed_change_rate));       
                      let tmp = Rate.map((row,idx)=>{ return row });    
                      setCoin(tmp)
                      sortInit();
                      e.target.innerText = '🔽'
                    }
                    
                  }}
                >
                    -
                </span>
            </th>
            <th>고가대비(52주)</th>
            <th>저가대비(52주)</th>
            <th>거래액(일)</th>
          </tr>
        </thead>
        <tbody>
        { 
        coinPrice.map((row,idx)=>{ 
             
            if(row.change === 'EVEN'){
              row.change = '-';
              row.stylecolor = null;
            }else if(row.change === 'FALL'){
              row.change = '😡';
              row.stylecolor = {'color':'red'};
            }else if(row.change === 'RISE'){
              row.change  = '😆';
              row.stylecolor = {'color':'lightseagreen'};
            }

            return (
              <tr key={idx}>
              <td style={{verticalAlign:'middle'}}>{row.market ?  row.market : ''}</td>
              <td style={{verticalAlign:'middle'}}>{row.korean_name}</td>
              <td style={{verticalAlign:'middle'}}>
                {row.trade_price.toLocaleString(undefined, {maximumFractionDigits: 5})} 
                {row.change}
              </td>
              <td style={ row.stylecolor}>
                {(row.signed_change_rate*100).toFixed(2)}%
                <div style={{color:'gray'}}>
                  ({row.signed_change_price.toLocaleString(undefined, {maximumFractionDigits: 5})}원)
                </div>
              </td>
              <td style={{verticalAlign:'middle'}}>{row.highest_52_week_price.toLocaleString(undefined, {maximumFractionDigits: 5})}<br/>({row.highest_52_week_date})</td>
              <td style={{verticalAlign:'middle'}}>{row.lowest_52_week_price.toLocaleString(undefined, {maximumFractionDigits: 5})}<br/>({row.lowest_52_week_date})</td> 
              <td style={{verticalAlign:'middle'}}>{ Math.ceil( row.acc_trade_price_24h ).toLocaleString() }원</td>
            </tr>
            )

          }) 
        }
        </tbody>
      </Table>
    </div>
  );
}

function sortInit(){
  [...document.querySelectorAll(".sort")].map((e,idx)=>{
    e.innerText = '-'
  });
}

export default App;
