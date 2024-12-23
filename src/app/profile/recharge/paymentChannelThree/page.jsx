"use client";
import Layout from "@/app/components/Layout";
import Image from "next/image";
import { FaRegCopy } from "react-icons/fa";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { useContext, useEffect, useState, Suspense } from "react";
import { UserContext } from "@/app/helpers/UserContext";
import Loading from "@/app/components/Loading";
import { AlertContext } from "@/app/helpers/AlertContext";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Copy } from "@/app/helpers/Copy";
import UploadComponent from "../uploadImage";

function page() {
  const [data, setData] = useState("");
  const [extraDetails, updateExtraDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasUploaded, setUploaded] = useState(false);
  const { getAlert } = useContext(AlertContext);
  const [amount, setAmount] = useState();
  const [disabled, setDisabled] = useState(false);
  let router = useRouter();

  async function getExtraDetails() {
    try {
      let res = await fetch(`/api/paymentDetails`);
      res = await res.json();
      if (res?.status === 200) {
        updateExtraDetails(res?.data?.BankDetails);
        setLoading(false);
      }
      if (res?.status === 302) {
        router.push("/access/login");
      }
    } catch (error) {
      router.push("/access/login");
    }
  }

  // immplementing the utr number value
  const [value, setValue] = useState("");
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 12 ) {
      setValue(inputValue);
    } else if (!inputValue) {
      getAlert("opps", "fill the utr number first");
    } else {
      getAlert("opps", "please fill correct utr number");
    }
  };

  useEffect(() => {
    getExtraDetails();
  }, []);

  async function rechargebtn() {

 
    if(!hasUploaded){
        getAlert("opps", "payment Screenshort is required.");
        return;
    }

    if (!amount || !value || value.length !== 12) {
      getAlert("opps", "kindly fill the  form completely");
    }
    else {
      try {
        let body = {
          TransactionId: value,
          Amount: amount,
          Channel: 3,
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
        if (res) {
          setDisabled(false);
        }
        if (res?.status === 200) {
          getAlert("success", "your deposit is under verification");
          router.push("/");
        } else if (res?.status === 500 || res?.status === 302) {
          getAlert("redirect", "something went wrong login again");
        } else {
          getAlert("opps", res?.message || "something went wrong login again");
        }
      } catch (error) {
        getAlert("redirect", "something went wrong login again");
      }
    }
  }

  const btndisbaled = () => {
    setDisabled(true);

    if (disabled === false) {
      rechargebtn();
    }
    setTimeout(() => {
      setDisabled(false);
    }, 4000);
  };

  return (
    <Layout>
      <section className="w-dvw h-dvh flex overflow-x-hidden flex-col items-center bg-gradient-to-t from-[#A3CBEE] to-[#FFC0C2] overflow-y-scroll pb-[12rem]  ">
        {/* loading component here */}
        {loading && <Loading />}

        <div className=" w-[90%] h-[15vh] mt-8 flex justify-center items-center ">
          <Image src={"/payzApp.png"} alt="logo" width={180} height={100} />
        </div>
        <div className="flex justify-between w-[90%] px-2 text-[.6rem] mt-4  ">
          <p className="font-semibold text-[#004B8D] ">#Order Id {Math.floor(Math.random()*100000)}</p>
          <span className="flex items-center font-semibold ">
            <Suspense>
              <RechargeAmount getAmount={setAmount} />
            </Suspense>
          </span>
        </div>

        <div className=" bg-[rgba(255,255,255,0.4)]  w-[90%] my-2 py-4 rounded-2xl px-2 ">
          <h1 className="font-semibold text-[.7rem] ">Pay to bank details</h1>

          <div className=" text-[0.6rem] py-2  ">
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="bg-[#EBEBEB] pl-2 py-1 rounded-t-[15px] text-[gray] "
            >
              Account Holder Name
            </div>
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="py-1 flex  justify-between bg-white items-center px-2 rounded-b-[15px]  "
            >
              <InputWithCopyIcon value={extraDetails.AccHolderName} />
            </div>
          </div>

          <div className=" text-[0.6rem] py-2  ">
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="bg-[#EBEBEB] pl-2 py-1 rounded-t-[15px] text-[gray] "
            >
              Bank Name
            </div>
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="py-1 flex  justify-between bg-white items-center px-2 rounded-b-[15px]  "
            >
              <InputWithCopyIcon value={extraDetails.BankName} />
            </div>
          </div>

          <div className=" text-[0.6rem] py-2 ">
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="bg-[#EBEBEB] pl-2 py-1 rounded-t-[15px] text-[gray] "
            >
              Account Number
            </div>
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="py-1 flex  justify-between bg-white items-center px-2 rounded-b-[15px]  "
            >
              <InputWithCopyIcon value={extraDetails.AccNumber} />
            </div>
          </div>

          <div className=" text-[0.6rem] py-2  ">
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="bg-[#EBEBEB] pl-2 py-1 rounded-t-[15px] text-[gray] "
            >
              IFSC Code
            </div>
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="py-1 flex  justify-between bg-white items-center px-2 rounded-b-[15px]  "
            >
              <InputWithCopyIcon value={extraDetails.Ifsc} />
            </div>
          </div>
        </div>

        <UploadComponent setUploaded={setUploaded} />

        <div className=" px-2 py-3 mt-4 w-[90%] bg-[rgba(255,255,255,0.4)] rounded-2xl ">
          <h1 className="font-semibold text-[0.7rem] ">
            Submit Reference/UTR Number
          </h1>
          <div className=" text-[0.6rem] py-2  ">
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className=" bg-[#2885F6] pl-2 py-1 rounded-t-[15px] text-[#FFF] "
            >
              Reference Number
            </div>
            <div
              style={{
                border: " 1px solid rgba(0, 0, 0, 0.05)",
              }}
              className="py-1 flex  justify-between bg-white items-center px-2 rounded-b-[15px]  "
            >
              <input
                type="number"
                value={value}
                onChange={handleChange}
                className="w-[80%] pl-2 bg-transparent outline-none "
              />
            </div>
          </div>

          <div
            onClick={() => btndisbaled()}
            disabled={disabled}
            style={{
              backgroundColor: disabled ? "#5A5A5A" : "#2885F6",
              boxShadow: "0 0 5px 0 #c0cad9",
            }}
            className="bg-[#2885F6] text-center p-3 mt-2 rounded-lg flex justify-center place-items-center text-[#fff] "
          >
            Recharge
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default page;

const InputWithCopyIcon = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const { getAlert } = useContext(AlertContext);

  const copyToClipboard = async (e) => {
    let isCopied = await Copy(value); //  returns true if successful
    if (isCopied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } else {
      getAlert(
        "opps",
        "unable to copy the text please try to copy it manually"
      );
    }
  };

  return (
    <div className="w-full flex justify-between items-center ">
      <input type="text" value={value} readOnly />
      <button style={{ color: "#2885F6" }} onClick={copyToClipboard}>
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

function RechargeAmount({ getAmount }) {
  const [receivedAmount, setReceivedAmount] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    let amount = searchParams.get("data");
    if (amount) {
      setReceivedAmount(amount);
      getAmount(amount);
    }
  }, []);

  return (
    <div className="flex  items-center  ">
      Amount <LiaRupeeSignSolid />{" "}
      <span className="min-w-[2rem]">{receivedAmount}</span>
    </div>
  );
}
