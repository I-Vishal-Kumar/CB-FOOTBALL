"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect, Suspense, useContext } from "react";
import Image from "next/image";
import { FaRegCopy } from "react-icons/fa6";
import { LiaRupeeSignSolid } from "react-icons/lia";
import { AlertContext } from "@/app/helpers/AlertContext";
import Layout from "@/app/components/Layout";
import { UserContext } from "@/app/helpers/UserContext";
import { Copy } from "@/app/helpers/Copy";
import { UpiRedirect } from "@/app/helpers/UpiRedirect";
import UploadComponent from "../uploadImage";

function Page() {
    // Popup handling here //
    let { getAlert } = useContext(AlertContext);
    let { extraDetails, getExtraDetails } = useContext(UserContext);
    let router = useRouter();

    const [disabled, setDisabled] = useState(false);
    const [hasUploaded, setUploaded] = useState(false);
    const [amount, setAmount] = useState();
    const [upiId, updateUpi] = useState([]);

    // immplementing the utr number value
    const [value, setValue] = useState("");
    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue.length <= 12) {
            setValue(inputValue);
        } else if (!inputValue) {
            getAlert("opps", "fill the utr number first");
        } else {
            getAlert("opps", "please fill correct utr number");
        }
    };

    // post request from the front-end
    async function submitDeposit() {
        getAlert();
            // if(!hasUploaded){
            //     getAlert("opps", "payment Screenshort is required.")
            //     return;
            // }
        if (value == "" || amount == "") {
            getAlert("opps", "fill the utr number first");
        } else if (value.length !== 12) {
            getAlert("opps", "please fill correct utr number");
        } else {
            try {
                let body = {
                    TransactionId: value,
                    Amount: amount,
                    Channel: 2,
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
    }

    useEffect(() => {
        if (!extraDetails?.UpiIds) {
            getExtraDetails();
        } else {
            updateUpi(extraDetails?.UpiIds || []);
        }
    }, [extraDetails]);

    const btndisbaled = () => {
        setDisabled(true);

        if (disabled === false) {
            submitDeposit();
            setTimeout(() => {
                setDisabled(false);
            }, 4000);
        }
    };

    return (
        <Layout>
            <div className='className="bg-white w-screen h-screen overflow-y-scroll pb-[12rem]'>
                <div className="flex place-items-center w-[90%] mr-auto ml-auto border-b-2 border-[lightgray] mt-2 py-3 px-2 text-[.7rem] ">
                    <LiaRupeeSignSolid />{" "}
                    <Suspense>
                        <RechargeAmount getAmount={setAmount} />
                    </Suspense>
                </div>

                {/* <div className="flex place-items-center w-[90%] mr-auto ml-auto  mt-2 py-3 px-2 justify-between text-[.6rem] ">
                    <p>UPI ID</p>
                    <CopyUPI
                        upiId={upiId[Math.floor(Math.random() * upiId?.length)]}
                    />
                </div> */}

                <div className="h-[35%] mt-3 flex flex-col justify-center place-items-center  text-[.6rem] ">
                    <div className="w-[60%] h-[90%]  flex justify-center items-center ">
                        <Image
                            src={
                                extraDetails?.QrChannel2
                                    ? `data:image/jpeg;base64,${extraDetails?.QrChannel2}`
                                    : "/logo.png"
                            }
                            alt="barCode"
                            height={80}
                            width={80}
                            className="object-contain w-[75%]  "
                        />
                    </div>
                    <p className="mt-2 font-[500] text-[#cf4b4b] ">
                        have you paid successfully?
                    </p>
                </div>

                <div className="mt-2 ">
                    <p className="uppercase text-center font-semibold text-[#0000009a] text-[.65rem] ">
                        Paytm, phonepe, googlepay, other bank
                    </p>
                    <div className="grid grid-cols-2 gap-3 w-[90%] mr-auto ml-auto p-2 mt-2  text-[.75rem] ">
                        <div  className="flex rounded-lg place-items-center  border-2 border-[lightgray] ">
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

                        <div  className="flex rounded-lg place-items-center  border-2 border-[lightgray] ">
                            <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                                <Image
                                    
                                    src={"/GooglePay.svg"}
                                    alt="paytm"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span>Google pay</span>
                        </div>

                        <div className="flex rounded-lg place-items-center  border-2 border-[lightgray] ">
                            <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                                <Image
                                   
                                    src={"/phonePay.svg"}
                                    alt="paytm"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span>Phonepe</span>
                        </div>

                        <div  className="flex rounded-lg place-items-center  border-2 border-[lightgray] ">
                            <div className="h-[3rem] w-[3rem] grid place-items-center  ">
                                <Image
                                    
                                    src={"/bhim.png"}
                                    alt="paytm"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span>Bhim</span>
                        </div>
                    </div>

                    {/* <UploadComponent setUploaded={setUploaded}  /> */}

                    <div className=" flex   w-[90%] mr-auto ml-auto  mt-3 ">
                        <p className="grid place-items-center font-semibold  text-[.75rem] ">
                            UTR
                        </p>
                        <div className=" flex w-[90%] justify-between ml-1 ">
                            <input
                                type="number"
                                placeholder="Input 12 digits here"
                                value={value}
                                onChange={handleChange}
                                className="border-2 border-[#8080807a] w-[75%] p-1 outline-none bg-transparent  text-[.75rem] "
                            />

                            <button
                                onClick={() => btndisbaled()}
                                disabled={disabled}
                                style={{
                                    backgroundColor: disabled
                                        ? "#5A5A5A"
                                        : "#2885F6",
                                }}
                                className="bg-[#2885F6] text-white  w-[23%]  text-[.65rem] "
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-[90%] mr-auto ml-auto pb-2 ">
                    <p className="text-center mt-5 text-red-600 text-xs  ">
                        Important reminder: After completing the UPI
                        transaction,please backfill Ref No./UTR No./Google Pay :
                        UPI Transaction ID/Freecharge: Transaction ID
                        (12digits). If you do not back fill UTR, 100% of the
                        deposit transaction will fail. Please be sure to
                        backfill!
                    </p>
                    <div className="w-[100%] mt-2  ">
                        <Image
                            src={"/channeltwo.png"}
                            alt="paytm"
                            width={100}
                            height={100}
                            className=" w-[100%] h-full object-contain "
                        />
                    </div>
                </div>

                <div className="h-[1rem] w-full bg-[#e0dfdf] "></div>

                <div className="w-[90%] h-[100%]  mr-auto ml-auto mt-2 ">
                    <Image
                        src={"/channelTwoInst.png"}
                        alt="paytm"
                        width={100}
                        height={100}
                        className="object-contain w-[100%] h-full  "
                    />
                </div>
            </div>
        </Layout>
    );
}

export default Page;

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
                <button onClick={copyToClipboard}>
                    <FaRegCopy />
                </button>
            </span>
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
        <div className="flex  items-center ">
            <p className="ml-1 text-[.65rem] font-semibold text-[#2885F6] ">
                {" "}
                {receivedAmount}{" "}
            </p>
        </div>
    );
}

// async (e) => {
//   let isCopied = await Copy("TEXT"); //  returns true if successful
//   getAlert(
//     isCopied ? "success" : "opps",
//     isCopied
//       ? "Invitation link copied successfully."
//       : "unable to copy the text please try to copy it manually"
//   );
// };
