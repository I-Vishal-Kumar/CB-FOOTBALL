"use client";

import React, { useState, useEffect, Suspense, useContext } from "react";
import { motion } from "framer-motion";
import { FaRegCopy } from "react-icons/fa6";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { AlertContext } from "@/app/helpers/AlertContext";
import Layout from "@/app/components/Layout";
import { UserContext } from "@/app/helpers/UserContext";
import { useRouter } from "next/navigation";
import { Copy } from "@/app/helpers/Copy";
import { UpiRedirect } from "@/app/helpers/UpiRedirect";
import UploadComponent from "../uploadImage";


function Page() {
    // Popup handling here //
    let { getAlert } = useContext(AlertContext);
    let { extraDetails, getExtraDetails } = useContext(UserContext);
    const [amount, setAmount] = useState();
    const [disabled, setDisabled] = useState(false);
    const [hasUploaded, setUploaded] = useState(false);

    const [upiId, updateUpi] = useState([]);

    let router = useRouter();

    // immplementing the utr number value
    const [value, setValue] = useState("");
    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue.length <= 12) {
            setValue(inputValue);
        } else if (!inputValue) {
            getAlert("opps", "fill the utr number first");
        } else {
            getAlert("opps", "fill 12 digit values only");
        }
    };

    const submitData = async () => {
        getAlert();
        
        if(!hasUploaded){
            getAlert("opps", "payment Screenshort is required.");
            return;
        }

        if (!value || !amount) {
            getAlert("opps", "kindly fill the  form completely");
            setDisabled(false);
        } else if (value.length !== 12) {
            getAlert("opps", "fill 12 digit values only");
            setDisabled(false);
        } else {
            try {
                let body = {
                    TransactionId: value,
                    Amount: amount,
                    Channel: 1,
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
                    getAlert(
                        "opps",
                        res?.message || "something went wrong login again"
                    );
                }
            } catch (error) {
                getAlert("redirect", "something went wrong login again");
            }
        }
    };

    const btndisbaled = () => {
        setDisabled(true);

        if (disabled === false) {
            submitData();
        }
    };

    useEffect(() => {
        if (!extraDetails?.UpiIds) {
            getExtraDetails();
        } else {
            updateUpi(extraDetails?.UpiIds || []);
        }
    }, [extraDetails]);

    return (
        <Layout>
            <div className="bg-white  w-full h-full  flex justify-center overflow-y-scroll pb-[12rem] ">
                <div className="w-[90%]  h-full flex flex-col  ">
                    <div
                        style={{
                            boxShadow: "0 0 4px 0 #c0cad9",
                        }}
                        className="border-2 border-white shadow-md my-[2rem] w-[100%] py-3 flex  justify-center place-items-center flex-col rounded-lg "
                    >
                        <Suspense>
                            <RechargeAmount getAmount={setAmount} />
                        </Suspense>
                        <p className="text-[.6rem] ">Payment Amount</p>
                    </div>

                    <div className="h-[30vh] grid place-items-center  ">
                        <div className="h-[90%] w-[60%] flex justify-center items-center  ">
                            <Image
                                src={
                                    extraDetails?.QrChannel1
                                        ? `data:image/jpeg;base64,${extraDetails?.QrChannel1}`
                                        : "/logo.png"
                                }
                                alt="qr code"
                                width={100}
                                height={100}
                                className="object-contain w-full h-full  "
                            />
                        </div>
                    </div>

                    <CopyUPI
                        upiId={upiId[Math.floor(Math.random() * upiId?.length)]}
                    />
                    <UploadComponent setUploaded={setUploaded} />
                    <div
                        style={{ boxShadow: "0 0 5px 0 #c0cad9" }}
                        className="bg-[white] mt-4 flex place-items-center border-2 rounded-lg border-[#2885F6] "
                    >
                        <p className="w-[20%] rounded-l-sm text-center bg-[#2885F6] text-white py-2  text-[.8rem] font-semibold focus-wit  ">
                            UTR
                        </p>
                        <input
                            type="number"
                            value={value}
                            onChange={handleChange}
                            placeholder="Enter the utr number"
                            className="w-[80%] outline-none  bg-[white] pl-3 text-[.7rem] rounded-lg "
                        />
                    </div>

                    <div
                        onClick={() => btndisbaled()}
                        disabled={disabled}
                        style={{
                            backgroundColor: disabled ? "#5A5A5A" : "#2888f6",
                            boxShadow: "0 0 5px 0 #c0cad9",
                        }}
                        className="bg-[#2888f6] rounded-lg text-center p-3 mt-4 flex justify-center items-center text-white  text-[.7rem] "
                    >
                        pay
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
            getAmount(amount);
        }
    }, []);

    return (
        <div className="flex  items-center ">
            <LiaRupeeSignSolid />
            <h1 className="text-[.7rem] font-semibold text-[#2888f6] ">
                {receivedAmount}
            </h1>
        </div>
    );
}

const CopyUPI = ({ upiId }) => {
    let { getAlert } = useContext(AlertContext);
    const copyToClipboard = async (e) => {
        let isCopied = await Copy(upiId); //  returns true if successful
        getAlert(
            isCopied ? "success" : "opps",
            isCopied
                ? "Upi Id copied successfully."
                : "unable to copy the text please try to copy it manually"
        );
    };

    return (
        <div>
            <span className="text-red-600 flex   justify-around place-items-center ">
                <p className="mr-2">{upiId}</p>
                <button className="bg-blue-400 rounded-md text-white" onClick={copyToClipboard}>
                    COPY
                </button>
            </span>
        </div>
    );
};
