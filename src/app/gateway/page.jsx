"use client"
import { useState } from "react";
import { sign } from "../api/payment/gateway/signApi";
import axios from "axios";

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
const test = async (amount, orderNo) => {
    const merchant_key = process.env.NEXT_PUBLIC_MERCHANT_KEY; // Set in .env file
    const reqUrl = process.env.NEXT_PUBLIC_REQUEST_URL;
    const page_url = 'https://cb-football.com/';
    const order_date = formatDate(new Date());
    const notify_url = `https://cb-football.com/api/payment/gateway`; 
    const pay_type = 151;
    const trade_amount = amount;
    const goods_name = 'PAYMENT'
    const mch_order_no= `${orderNo}`;
    const sign_type = 'MD5';
    const mch_id = process.env.NEXT_PUBLIC_MERCHANT_ID;
    const version = '1.0';

    // Construct the sign string
    let signStr = `goods_name=${goods_name}&mch_id=${mch_id}&mch_order_no=${mch_order_no}&notify_url=${notify_url}&order_date=${order_date}&page_url=${page_url}&pay_type=${pay_type}&trade_amount=${trade_amount}&version=${version}`;

    const signature = sign(signStr, merchant_key);
   
    const postData = {
        goods_name,
        mch_id,
        mch_order_no,
        notify_url,
        order_date,
        page_url,
        pay_type,
        trade_amount,
        version,
        sign_type,
        sign: signature,
      };
      console.log(reqUrl)
      const data = await axios.post(reqUrl, postData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log(data);
      if(data.data?.respCode === 'SUCCESS'){
        window.open(data.data.payInfo);
      }else{
        alert('something went wrong please try other gateway for now.')
      }
}

export default function Page(){
  const [amount, setAmount] = useState(100.00); // Default value
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
 
    try {

      const orderNo = Date.now();
      const reqBody = {orderNo,amount}
  
      const res = await fetch("/api/payment/initiateGateway", {
        method: 'POST',
        headers: {
          'content-type': "application/json"
        },
        body: JSON.stringify(reqBody)
      })
      let resBody = await res.json();

      if(resBody?.status !== 200 ){
        alert('something went wrong');
      }
      setLoading(true);
      await test(amount, orderNo)
      setLoading(false);
    } catch (error) {
      alert(error);
    }
  }

  return (
      <div className="max-w-lg mx-auto mt-10 p-4 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-center mb-4">Payment Gateway</h1>
          
          <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Enter Amount</label>
              <input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
              />
          </div>

          <button 
              onClick={initiatePayment} 
              className={`w-full py-2 mt-4 text-white ${loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} rounded-md`}
              disabled={loading}
          >
              {loading ? 'Processing...' : 'Pay Now'}
          </button>
      </div>
  );
}

