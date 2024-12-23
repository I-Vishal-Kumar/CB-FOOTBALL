"use client";
import BackButton from "@/app/components/BackButton";
import React, { useState, useEffect, Suspense, useContext } from "react";
import { RiSecurePaymentLine } from "react-icons/ri";
import { IoQrCodeOutline } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AlertContext } from "@/app/helpers/AlertContext";
import Layout from "@/app/components/Layout";
import { UserContext } from "@/app/helpers/UserContext";
import { Copy } from "@/app/helpers/Copy";
import Image from "next/image";
import UploadComponent from "../uploadImage";


function Page() {
  // Popup handling here //
  let { getAlert } = useContext(AlertContext);
  let { extraDetails, getExtraDetails } = useContext(UserContext);
  const [amount, setAmount] = useState();
  const [depositAddress, updateDepositAddress] = useState("");
  const [hasUploaded, setUploaded] = useState(false);

  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const [usdtAmount,updateUsdtAmount] = useState(null);

  // implementing the function which copies the address value //
  const [text, setText] = useState("TLNpPzXAMhW1rh32TddcRJDhPj5EeD2gH7");
  const [transactionId, setTransactionId] = useState("");

  const copyAddress = async () => {
    let isCopied = await Copy(text); //  returns true if successful
    getAlert(
      isCopied ? "success" : "opps",
      isCopied
        ? "Invitation link copied successfully."
        : "unable to copy the text please try to copy it manually"
    );
  };
  const copyTransactionId = async () => {
    if (transactionId.trim() === "") {
      getAlert("opps", "enter some text to copy ");
      return;
    }
    let isCopied = await Copy(transactionId); //  returns true if successful
    getAlert(
      isCopied ? "success" : "opps",
      isCopied
        ? "Transaction Id copied successfully."
        : "unable to copy the text please try to copy it manually"
    );
  };


  async function usdtDetails() {
    getAlert();
    
    if(!hasUploaded){
        getAlert("opps", "payment Screenshort is required.");
        return;
    }

    if (!transactionId || !text || !amount) {
      getAlert("opps", "please fill each input field.");
      return;
    } else {
      try {
        // updateUsdtAmount(amount*80)
        let body = {
          TransactionId: transactionId,
          Amount: amount*80,
          Channel: 4,
        };
        let config = {
          method: "POST",
          headers: {
            "content-type": "applicaiton/json",
          },
          body: JSON.stringify(body),
        };

        let res = await fetch("/api/payment/deposit", config);
        res = await res.json();
        if (res?.status === 200) {
          getAlert("success", "your payment is under verification");
          router.push("/");
        } else if (res?.status === 500 || res?.status === 302) {
          getAlert("redirect", "something went wrong");
        } else {
          getAlert("opps", res?.message || "something went wrong");
        }
      } catch (error) {
        getAlert("redirect", "something went wrong");
      }
    }
  }

  useEffect(() => {
    let adress = extraDetails?.UpiIds;
    if (!adress) {
      getExtraDetails();
    } else {
      updateDepositAddress(extraDetails?.UpiIds[2] || "213123");
    }
  }, [extraDetails]);

  const btndisbaled = () => {
    setDisabled(true);

    if (disabled === false) {
      usdtDetails();
    }
    setTimeout(() => {
      setDisabled(false);
    }, 2000);
  };
  return (
    <Layout>
      <div className="w-screen h-screen bg-[#F8FCFF]  pb-[12rem] overflow-y-scroll  flex flex-col place-items-center  ">
        <div onClick={() => router.back()} className=" w-screen mt-4 ">
          <BackButton pageName="Usdt" />
        </div>

        <div className="w-[90%] h-full mt-[2rem] ">
          <div className="flex justify-between text-[.6rem] ">
            <p>Secure</p>
            <p className="flex place-items-center ">
             <Image src={'/uniPayment.png'} alt="..." width={80} height={50} />
            </p>
          </div>

          <div
            style={{ boxShadow: "0px 5px 10px 0px #0000000D" }}
            className=" bg-[#fff] mt-2 px-2 rounded-lg py-1 flex justify-between text-[0.6rem] "
          >
            <div className=" ">
              <p className="font-[500] text-[#000000d3] ">
                Order <span># {Math.floor(Math.random()*100000)}</span>
              </p>
              <p className="font-light text-[gray] ">C.B football</p>
            </div>
            <div>
              <Suspense>
                {" "}
                <RechargeAmount getAmount={setAmount} />{" "}
              </Suspense>
            </div>
          </div>

          <div
            style={{ boxShadow: "0px 5px 10px 0px #0000000D" }}
            className="w-full h-min bg-[#FFF] mt-4  rounded-2xl p-3 "
          >
            <span className="flex place-items-center font-[500] text-[.65rem] text-[#000000d3]  ">
              <IoQrCodeOutline className="mr-1 text-[#000000d3] " /> Scan QR
              code{" "}
            </span>

            <div className="w-[40vw] h-[20vh] grid place-items-center mr-auto ml-auto my-3 ">
              <Image
                src={'/usdt.jpg'}
                alt="barCode"
                width={100}
                height={100}
                className="object-cover  h-[95%] w-[95%]  "
              />
            </div>

            <div className="flex justify-between ">
              <div className="w-[30%] ">
                <span className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">
                  Network
                </span>
                <button
                  style={{ border: "1px solid #808080" }}
                  className="py-1 flex place-items-center justify-center w-[80%] rounded-md "
                >
                  <Image src={'/usdt/usdtNetwork.png'} alt="..." width={15} height={15} unoptimized className="mr-1.5 " />
                  <p className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">TRC20</p>
                </button>
              </div>

              <div className="w-[30%] ">
                <span className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">
                  Coin
                </span>
                <button
                  style={{ border: "1px solid #808080" }}
                  className="py-1 flex place-items-center justify-center w-[80%] rounded-md "
                >
                  <Image src={'/usdt/usdtcoln.png'} alt="..." width={15} height={15} unoptimized className="mr-1.5" />
                  <p className="text-[rgb(0,0,0,0.5)] text-[.65rem] ">USDT</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 ">
            <p className="font-[500] text-[.7rem] ">Deposit Address</p>
            <div className="flex justify-between rounded-lg bg-transparent border-2 border-[#2885F6] p-2 ">
              <input
                type="text"
                placeholder="Enter Your Deposit Address"
                value={text}
                disabled
                className="w-[80%] bg-transparent text-[.65rem] "
              />
              <FaRegCopy
                onClick={() => copyAddress()}
                className="text-[#2885F6] "
              />
            </div>
          </div>

          <UploadComponent setUploaded={setUploaded} />

          <div className="mt-4 ">
            <p className="font-[500] text-[.7rem] ">Transaction Id</p>
            <div className="flex justify-between rounded-lg bg-transparent border-2 border-[#2885F6] p-2 ">
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Paste here your Transaction Id"
                className="w-[80%] bg-transparent text-[.65rem] "
              />
              {/* <FaRegCopy
                onClick={() => copyTransactionId()}
                className="text-[#2885F6] "
              /> */}
            </div>
          </div>

          <div
            onClick={() => btndisbaled()}
            disabled={disabled}
            style={{
              backgroundColor: disabled ? "#5A5A5A" : "#2885F6",
              boxShadow: "0 0 5px 0 #c0cad9",
            }}
            className="bg-[#2885F6] text-center p-3 mt-4 rounded-lg flex justify-center place-items-center text-[#fff] text-[.7rem] "
          >
            Recharge
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Page;

function RechargeAmount({ getAmount }) {
  const [receivedAmount, setReceivedAmount] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    let amount = searchParams.get("data");
    if (amount) {
      setReceivedAmount(amount);
    }
  }, []);

  // implementing the function which converts indian rupees value into usdt values
  const [usdt, SetUsdt] = useState("");
  function usdtConvertor() {
    let usdtValue = (receivedAmount / 80).toFixed(2);
    SetUsdt(usdtValue);
    getAmount(usdt);
  }

  useEffect(() => {
    usdtConvertor();
  });

  return (
    <div className="flex  items-center  ">
      <p className="ml-1 text-[.65rem] font-[500] text-[#000000d3] ">
        {" "}
        ${usdt}{" "}
      </p>
      <p className="ml-1 text-[.65rem] font-[500] text-[#000000d3] ">(USDT)</p>
    </div>
  );
}
