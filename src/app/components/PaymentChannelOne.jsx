"use client";
import React, { useState } from "react";
import { Dropdown } from "flowbite-react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

// import { LiaAngleDownSolid, LiaAngleRightSolid } from "react-icons/lia";

const accorodient = {
  show: {
    height: "28%",
  },
  hide: {
    height: "5%",
  },
  showBarCode: {
    opacity: 1,
  },
  hideBarCode: {
    opacity: 0,
  },
};

function PaymentChannelOne() {
  const [BarCode, setBarCode] = useState(true);
  return (
    <div className="bg-white w-full h-full absolute top-0 left-0 flex justify-center ">
      <div className="w-[90%]  h-full flex flex-col place-items-center0 ">
        <div
          style={{
            boxShadow: "0 0 5px 0 #c0cad9",
          }}
          className="border-2 border-white shadow-md my-[2rem] w-[100%] py-3 flex  justify-center place-items-center flex-col rounded-lg "
        >
          <h1 className="flex">
            $<p>10000</p>
          </h1>
          <p>Payment Amount</p>
        </div>

        <div
          style={{
            boxShadow: "0 0 5px 0 #c0cad9",
          }}
          className=" py-2 grid place-items-center "
        >
          <div
            className=" border-b-2 border-[#d3cccc52]
           h-[3rem] flex justify-between place-items-center w-[95%] mr-auto ml-auto my-1  "
          >
            <div className="flex justify-center place-items-center ">
              <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                <Image
                  src={"/paytm.png"}
                  alt="paytm"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span>Paytm</span>
            </div>
            <div className="mr-1rem ">
              <input type="radio" name="payment" id="" />
            </div>
          </div>

          <div
            className="border-b-2 border-[#d3cccc52] pb-2
            h-[3rem] flex justify-between place-items-center w-[95%] mr-auto ml-auto my-1 "
          >
            <div className="flex justify-center place-items-center ">
              <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                <Image
                  src={"/phonePay.svg"}
                  alt="paytm"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span>Phone pay</span>
            </div>
            <div className="mr-1rem ">
              <input type="radio" name="payment" id="" />
            </div>
          </div>

          <div
            className=" border-b-2 border-[#d3cccc52] pb-2
            h-[3rem] flex justify-between place-items-center w-[95%] mr-auto ml-auto my-1 "
          >
            <div className="flex justify-center place-items-center ">
              <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                <Image
                  src={"/Mobikwik.svg"}
                  alt="mobi"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span>Mobikwik</span>
            </div>
            <div className="mr-1rem ">
              <input type="radio" name="payment" id="" />
            </div>
          </div>

          <div
            className=" border-b-2 border-[#d3cccc52] pb-2
           h-[3rem] flex justify-between place-items-center w-[95%] mr-auto ml-auto my-1 "
          >
            <div className="flex justify-center place-items-center ">
              <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                <Image
                  src={"/GooglePay.svg"}
                  alt="google"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span>Google pay</span>
            </div>
            <div className="mr-1rem ">
              <input type="radio" name="payment" id="" />
            </div>
          </div>

          <div
            className="
           h-[3rem] flex justify-between place-items-center w-[95%] mr-auto ml-auto pb-1 "
          >
            <div className="flex justify-center place-items-center ">
              <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                <Image
                  src={"/Upi.svg"}
                  alt="svg"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span>Upi</span>
            </div>
            <div className="mr-1rem ">
              <input type="radio" name="payment" id="" />
            </div>
          </div>
        </div>

        <motion.div
          variants={accorodient}
          animate={BarCode ? "show" : "hide"}
          style={{ boxShadow: "0 0 5px 0 #c0cad9" }}
          className="mt-[1rem] rounded-lg h-[5%]  "
          onClick={() => setBarCode(!BarCode)}

        >
          <div
            className="py-1 flex justify-between mr-2 ml-2 place-items-center "
          >
            <p className="font-bold text-[#000000b2] ">Click to show QRcode</p>
            <p>
              {BarCode?<MdOutlineKeyboardArrowDown />:<MdOutlineKeyboardArrowRight/>}
            </p>
          </div>

          <motion.div 
          variants={accorodient}
          animate={BarCode?"showBarCode":"hideBarCode"}
          className="h-[50%] opacity-0 ">
            <div className="flex justify-center place-items-center h-full my-2 h-  ">
              <Image
                src=""
                alt=""
                width={90}
                height={90}
                objectFit="contain"
                className="border-2 border-black "
              />
            </div>

            <p className="uppercase text-center font-semibold text-[#b93939] text-[.9rem] ">
              One qr code for single payment only
            </p>
          </motion.div>
        </motion.div>

        <div
          style={{ boxShadow: "0 0 5px 0 #c0cad9" }}
          className="bg-[#9fa8b8] text-center p-3 mt-4 flex justify-center place-items-center text-white "
        >
          pay $ <p className="ml-1 ">10000</p>
        </div>

        <div
          style={{ boxShadow: "0 0 5px 0 #c0cad9" }}
          className="bg-white text-center p-3 mt-4 flex justify-center place-items-center text-[#9fa8b8] rounded-lg "
        >
          Payment Failed
        </div>
        
      </div>
    </div>
  );
}

export default PaymentChannelOne;
