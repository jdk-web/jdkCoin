import { useQuery } from '@tanstack/react-query';
import './App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useTransition } from 'react';
import { Table, Form, InputGroup  } from 'react-bootstrap';
const Hangul = require('hangul-js');

function App() {
  let [coin,setCoin] = useState([]);
  let [coinPrice, setCoinPrice] = useState([])
  let [tmpCoin, setTmpCoin] = useState([]);
  let [search, setSearch] = useState(false);
  let [isPending, startTransition] = useTransition()
  
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
const getCoin = async () => {
  let result = await axios
  .request({method: 'GET',
  url: 'https://api.upbit.com/v1/ticker',
  headers: {accept: 'application/json'},
  params :{'markets':market_param}})
  .then(function (response) {
    let data = coin.map((item, i) => Object.assign({}, item, response.data[i]));
    setCoinPrice(data);
    return true;
  })
  .catch(function (error) {
    return false;
  })
  return result;
};

useQuery(['coin'], ()=>getCoin(),{refetchInterval:500})

//🔽
  return (
    <div className="App" style={{marginTop:'185px', marginLeft:'50px', marginRight:'50px'}}>
      <span>암호화폐 총 개수 : {coinPrice.length} 개</span> 
      <InputGroup className="mb-3" style={{width:'250px','color':'gray'}}>
        <Form.Control
          placeholder='비트코인,ㅂㅌㅋㅇ'
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
          style={{backgroundColor:'black', color:'white'}}
          onChange={(el)=>{
           
            if(search === false)
              setTmpCoin(coinPrice);

            startTransition(()=>{
              if( el.target.value.length<1){
                setSearch(false);
                setCoin(tmpCoin);
              }else{
                setSearch(true);
                let found = tmpCoin.filter(e => {
                  /*초성 검색*/
                  let disassemble = Hangul.disassemble(e.korean_name,true);
                  let cho="";
                  for (let i=0,l=disassemble.length;i<l;i++){
                    cho+=disassemble[i][0];
                  }
                  return (e.korean_name.includes(el.target.value)  || (cho.includes(el.target.value)))
                }
                );

                console.log(found)
                if(found){
                  setCoin(found)
                }else{
                  setCoin([])
                }
                
              }
            })

         
          }}
        />
      </InputGroup>

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
                  ➖
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
                  ➖
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
                    ➖
                </span>
            </th>
            <th>고가대비(52주)</th>
            <th>저가대비(52주)</th>
            <th>거래액(일)</th>
          </tr>
        </thead>
        <tbody>
        { 
        (coinPrice.length > 0) ? coinPrice.map((row,idx)=>{ 
             
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
              <td style={{verticalAlign:'middle'}}>{ numberToKorean(Math.ceil( row.acc_trade_price_24h )).toLocaleString() }원</td>
            </tr>
            )

          })  : <tr><td colSpan={7}>데이터가 없습니다</td></tr>
        } 
        </tbody>
      </Table>
    </div>
  );
}

function sortInit(){
  [...document.querySelectorAll(".sort")].map((e,idx)=>{
    e.innerText = '➖'
  });
}

function numberToKorean(number){
  var inputNumber  = number < 0 ? false : number;
  var unitWords    = ['', '만', '억', '조', '경'];
  var splitUnit    = 10000;
  var splitCount   = unitWords.length;
  var resultArray  = [];
  var resultString = '';

  for (var i = 0; i < splitCount; i++){
       var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
      unitResult = Math.floor(unitResult);
      if (unitResult > 0){
          resultArray[i] = unitResult;
      }
  }

  for (var i = 0; i < resultArray.length; i++){
      if(!resultArray[i]) continue;
      resultString = String(resultArray[i]) + unitWords[i] + resultString;
  }
  return resultString;
}

export default App;
