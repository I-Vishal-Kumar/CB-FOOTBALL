"use client";
import Image from "next/image";
import { FaInfoCircle, FaRupeeSign } from "react-icons/fa";
import { FaDollarSign, FaLock, FaPlay, FaPlus } from "react-icons/fa6";
import { GrFormEdit } from "react-icons/gr";
import { useContext, useState } from "react";
import { IoIosClose } from "react-icons/io";
import AddBank from "@/app/components/AddBank";
import Layout from "@/app/components/Layout";
import OtpInputs from "@/app/components/OtpInputs";
import { UserContext } from "@/app/helpers/UserContext";
import { useRouter } from "next/navigation";
import { AlertContext } from "@/app/helpers/AlertContext";
import Loading from "@/app/components/Loading";
import { useEffect } from "react";
import Back from "@/app/components/LiveChats/Back";
import Authenticate from "@/app/components/Authenticate";

function Page() {
    const [getVerification, updateGetVerif] = useState(false);
    const [verifPhone, updateVerificationMethod] = useState(true);
    const { userBalance, userOtherData, getBalance } = useContext(UserContext);
    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [editBank, updateEditBank] = useState(false);
    const [updating, setUpdatingBank] = useState(false);
    const [isVerified, setVerified] = useState(false);
    const [otpSent, updateOtpSent] = useState(false);
    const [loading, setLoading] = useState(true);
    let { getAlert } = useContext(AlertContext);
    const [Amount, updateAmount] = useState(0);
    const [withdrawPass, updateWithdrawPass] = useState('');
    const [withdrawReady, setWithdrawReady] = useState(false);
    const router = useRouter();

    async function verify() {
        let EnteredOtp = otp.join("");
        EnteredOtp = Number(EnteredOtp);
        let cookies = document.cookie;
        let providedOtp;
        const [name, value] = cookies.split("=");
        if (name === "otp") {
            providedOtp = value;
        }
        if (EnteredOtp === Number(providedOtp)) {
            setVerified(true);
            updateEditBank(true);
            return true;
        }
        setVerified(false);
        return false;
    }

    async function verify_transfer_otp() {
        let EnteredOtp = otp.join("");
        EnteredOtp = Number(EnteredOtp);
        let cookies = document.cookie;
        let providedOtp;
        const [name, value] = cookies.split("=");
        if (name === "otp") {
            providedOtp = value;
        }
        if (EnteredOtp === Number(providedOtp)) {
            updateEditBank(true);
            return true;
        }
        setVerified(false);
        return false;
    }

    const [isLocalBank, updateBank] = useState(true);

    async function getOtp() {
        try {
            getAlert();
            let res = await fetch(
                "/api/otp/" + `${verifPhone ? "phone" : "email"}`
            );
            res = await res.json();
            if (res?.status === 200) {
                updateOtpSent(true);
                getAlert("success", res?.message || "Success");
            } else if (res?.status === 302) {
                getAlert("redirect", res?.message || "session time out");
            } else {
                getAlert("opps", res?.message || "something went wrong");
            }
        } catch (error) {
            getAlert("redirect", res?.message || "something went wrong");
        }
    }
    async function getEditOtp() {
        try {
            getAlert();
            let res = await fetch(
                "/api/otp/" + `${verifPhone ? "phone" : "email"}`
            );
            res = await res.json();
            if (res?.status === 200) {
                updateGetVerif(true);
                setUpdatingBank(true);
                getAlert("success", res?.message || "success");
            } else if (res?.status === 302) {
                getAlert("redirect", res?.message || "session time out");
            } else {
                getAlert("opps", res?.message || "something went wrong");
            }
        } catch (error) {
            getAlert("redirect", res?.message || "something went wrong");
        }
    }

    async function withdraw() {
        try {
            getAlert();
            // let isVerified = await verify_transfer_otp();
            // if (!withdrawReady) {
            //     getAlert("opps", "Incorrect otp.");
            //     return;
            // }
            let isValidTime = await validateTime();
            if (!isValidTime) {
                getAlert(
                    "opps",
                    "you can withdraw from 10:00 AM to 16:00 PM UTC on working days i.e Monday to Friday. Withdrawals are not available on Saturday and Sunday."
                );
                return;
            }
            if (Amount < 600) {
                getAlert("opps", "minimum withdrawal amount is 600");
                return;
            }else if(!withdrawPass){
                getAlert("opps", "Withdrawal password is required");
                return;
            }
            let config = {
                method: "POST",
                header: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Amount, isLocalBank, WithdrawCode: withdrawPass }),
            };
            let res = await fetch("/api/payment/withdraw", config);
            if (res?.ok) {
                res = await res.json();
                if (res?.status === 200) {
                    getAlert("success", res?.message || "success");
                } else if (res?.status === 302) {
                    getAlert("redirect", res?.message || "session time out");
                } else {
                    getAlert("opps", res?.message || "something went wrong");
                }
            }
        } catch (error) {
            getAlert("redirect", res?.message || "session time out");
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    });

    useEffect(() => {
        if (!userBalance && !userOtherData?.UserName) {
            getBalance();
        } else {
            // update the verifPhone to tru if not international;
            updateVerificationMethod(!userOtherData?.International);
        }
    }, [userBalance, userOtherData]);

    function afterVerification(phoneNumber) {
        try {
            if (Number(userOtherData?.PhoneNumber) !== Number(phoneNumber)) {
                getAlert(
                    "opps",
                    `please verify the same number you registered with ending with ${userOtherData?.PhoneNumber?.slice(
                        -3
                    )}.`
                );
            } else {
                setWithdrawReady(true);
            }
        } catch (error) {
            getAlert("opps", "something went wrong");
        }
    }
    function editBankings(phoneNumber) {
        try {
            if (Number(userOtherData?.PhoneNumber) !== Number(phoneNumber)) {
                getAlert(
                    "opps",
                    `please verify the same number you registered with ending with ${userOtherData?.PhoneNumber?.slice(
                        -3
                    )}.`
                );
            } else {
                setVerified(true);
                updateEditBank(true);
            }
        } catch (error) {
            getAlert("opps", "something went wrong");
        }
    }

    return (
        <Layout>
            <section className="bg-[#F8FCFF] relative top-0 left-0 overflow-hidden w-full h-[100dvh]">
                {/* loading component here */}
                {loading && <Loading />}

                <Back page={"payment withdrawal"} />
                <main className=" space-y-1  h-fit px-4 ">
                    {/* hero section */}
                    <div
                        style={{
                            background:
                                "url(/profileBg.jpg) center no-repeat",
                            backgroundSize: "cover",
                        }}
                        className=" h-[65%] py-4  relative w-full  
       rounded-xl"
                    >
                        <div className="flex  flex-col w-full justify-center items-center py-3">
                            <span
                                className=" size-16
              ring-[3px] relative ring-white overflow-hidden rounded-full "
                            >
                                <Image
                                    style={{ height: "100%", width: "100%" }}
                                    src={
                                        userOtherData?.Avatar
                                            ? `/avatar/${userOtherData?.Avatar}.png`
                                            : "/logo.png"
                                    }
                                    height={40}
                                    unoptimized
                                    width={40}
                                    alt="logo"
                                ></Image>
                            </span>
                            <h2 className="capitalize text-sm mt-2 truncate font-extrabold text-white">
                                {userOtherData?.UserName || "user Name"}
                            </h2>
                        </div>
                        <div className="w-full mt-1  px-2">
                            <div className="rounded-full   py-0.5 flex justify-between">
                                <div
                                    className="flex  text-white rounded-full flex-row-reverse bg-gray-500/50 px-2 space-x-1
              gap-x-2 items-center justify-end"
                                >
                                    <span className=" aspect-square relative flex justify-center items-center text-gray-600 rounded-full bg-gray-200  p-0.5 ">
                                        {userOtherData?.LocalBankAdded ===
                                        true ? (
                                            <Image
                                                src={"/tick_mark.png"}
                                                height={8}
                                                width={8}
                                                alt="added"
                                            />
                                        ) : (
                                            <Image
                                                src={"/wrong.png"}
                                                height={8}
                                                width={8}
                                                alt="added"
                                            />
                                        )}
                                    </span>
                                    <p className="capitalize  font-bold text-[0.65rem]">
                                        bank account
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={() => {
                                if (
                                    !userOtherData?.UsdtBankAdded ||
                                    !userOtherData?.LocalBankAdded
                                ) {
                                    updateEditBank(true);
                                } else {
                                    getAlert(
                                        "opps",
                                        "already added bank details you can edit them"
                                    );
                                }
                            }}
                            className=" absolute h-[30%] bg-[#333333] rounded-full text-white left-[50%] translate-x-[-50%] top-[100%] translate-y-[-50%] aspect-square flex text-[2rem] justify-center items-center"
                        >
                            <FaPlus />
                        </div>
                    </div>
                    {/* reacharge and balance section */}
                    <div className="pt-1  px-1">
                        <div className=" py-2 mt-4 relative  flex justify-between flex-row-reverse rounded-full p-1">
                            <div className="flex pl-1 bg-slate-50 ring-1 ring-gray-200 rounded-full p-0.5 justify-center items-center px-1 space-x-1">
                                <span
                                    className=" h-full aspect-square rounded-full text-white 
             bg-[#333333] flex text-[0.7rem] p-0.5 justify-center items-center"
                                >
                                    <FaRupeeSign />
                                </span>

                                <span className="text-sm font-bold pr-3">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "decimal",
                                        maximumFractionDigits: 2,
                                    }).format(userBalance || 0)}
                                </span>
                                <span
                                    onClick={() =>
                                        router.push("/profile/recharge")
                                    }
                                    className=" h-full aspect-square rounded-full text-white 
                                    bg-[#333333] flex text-[0.8rem] p-0.5 justify-center items-center"
                                >
                                    <FaPlus />
                                </span>
                            </div>

                            <div className="flex pl-1   justify-center flex-row-reverse items-center space-x-1">
                                <span className=" text-[0.8rem] text-gray-800 font-extrabold capitalize pr-3">
                                    transfer to bank
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
                <div className="h-[60%] pt-2 ">
                    <div className="h-full overflow-y-scroll pb-40 px-4">
                        <div className="px-1">
                            <div className=" relative  flex justify-between flex-row-reverse rounded-full p-1">
                                <div className="flex  bg-slate-50 ring-1 ring-gray-200 rounded-full py-1 text-xs justify-center items-center px-2 space-x-2">
                                    <span
                                        className=" h-full font-semibold capitalize  rounded-full 
              flex   justify-center items-center"
                                    >
                                        withdrawable profit
                                    </span>
                                    <div className="flex text-xs text-red-500 font-medium space-x-0">
                                        <span>
                                            {(
                                                (userOtherData?.Profit || 0) / 100
                                            ).toFixed(2)}
                                        </span>
                                       
                                    </div>
                                </div>

                                <div className="flex pl-1 justify-center flex-row-reverse items-center space-x-1">
                                    <span className="  text-gray-800 font-bold text-[0.6rem] capitalize pr-3">
                                        choose bank transfer
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* radio buttons */}
                        <div className="px-2 space-y-3  rounded-md  py-2">
                            <div className="flex px-3 py-2  bg-white rounded-md items-center">
                                <div className=" mr-2">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 25 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clipPath="url(#clip0_131_380)">
                                            <path
                                                d="M4.16665 10.4165V17.7082H7.29165V10.4165H4.16665ZM10.4166 10.4165V17.7082H13.5416V10.4165H10.4166ZM2.08331 22.9165H21.875V19.7915H2.08331V22.9165ZM16.6666 10.4165V17.7082H19.7916V10.4165H16.6666ZM11.9791 1.0415L2.08331 6.24984V8.33317H21.875V6.24984L11.9791 1.0415Z"
                                                fill="#000"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_131_380">
                                                <rect
                                                    width="25"
                                                    height="25"
                                                    fill="white"
                                                />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex-[3] capitalize font-semibold text-[0.6rem]">
                                    {" "}
                                    local bank transfer
                                </div>
                                <div className="flex-[1] flex justify-end items-center">
                                    <input
                                        type="radio"
                                        name="bank"
                                        onChange={() =>
                                            updateBank((prev) => !prev)
                                        }
                                        checked={isLocalBank}
                                        value={"local"}
                                        className="size-5"
                                    />
                                </div>
                            </div>
                            
                        </div>

                        <div className=" px-2 mt-2">
                            {isLocalBank ? (
                                <>
                                    <div>
                                        <div className="flex capitalize font-semibold text-[0.6rem] space-x-2 ">
                                            <span className="w-[50%]">
                                                transfer amount
                                            </span>
                                            <span className="w-[50%] pl-3">
                                                after tax of 10%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ring-[1.5px] ring-[#11468F] py-2 mt-1 rounded-md">
                                        <div className="flex capitalize font-semibold text-[0.65rem] space-x-2 ">
                                            <div className=" flex w-[50%] space-x-2 px-2">
                                                <span
                                                    className=" h-full aspect-square rounded-full text-white 
           bg-[#333333] flex text-[0.7rem] p-1 justify-center items-center"
                                                >
                                                    <FaRupeeSign />
                                                </span>
                                                <input
                                                    type="number"
                                                    value={Amount}
                                                    onChange={(e) =>
                                                        updateAmount(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter value"
                                                    className="w-full h-full bg-transparent outline-none text-gray-600 "
                                                />
                                            </div>
                                            <div className=" flex w-[50%] space-x-2 px-2">
                                                <span
                                                    className=" h-full aspect-square rounded-full text-white 
           bg-[#333333] flex text-[0.7rem] p-1 justify-center items-center"
                                                >
                                                    <FaRupeeSign />
                                                </span>
                                                <input
                                                    type="number"
                                                    disabled
                                                    value={
                                                        Number(((Amount * 0.9)).toFixed(2))
                                                    }
                                                    className="w-full h-full outline-none text-green-600"
                                                    name=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ring-[1.5px] mt-3 ring-[#11468F] py-2 rounded-md">
                                        <div className="flex capitalize font-semibold text-[0.65rem] space-x-2 ">
                                            <div className=" flex w-[50%] space-x-2 px-2">
                                                <span
                                                    className=" h-full aspect-square rounded-full text-white 
           bg-[#333333] flex text-[0.7rem] p-1 justify-center items-center"
                                                >
                                                    <FaLock />
                                                </span>
                                                <input
                                                    type="text"
                                                    value={withdrawPass}
                                                    onChange={(e) =>
                                                        updateWithdrawPass(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter withdrawal password"
                                                    className="w-full h-full bg-transparent outline-none text-gray-600 "
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-[0.69rem] capitalize font-bold text-gray-800">
                                            FX current exchange rate Rs. 80 = $1
                                        </p>
                                        <div className="flex mt-3 capitalize font-semibold text-[0.6rem] space-x-2 ">
                                            <span className="w-[50%]">
                                                transfer amount
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ring-[1.5px] ring-blue-600 py-2 mt-1 rounded-md">
                                        <div className="flex capitalize font-semibold text-[0.65rem] space-x-2 ">
                                            <div className=" flex w-[50%] space-x-2 px-2">
                                                <span
                                                    className=" h-full aspect-square rounded-full text-white 
                        bg-[#333333] flex text-[0.7rem] p-1 justify-center items-center"
                                                >
                                                    <FaRupeeSign />
                                                </span>
                                                <input
                                                    type="number"
                                                    value={Amount}
                                                    onChange={(e) =>
                                                        updateAmount(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter value"
                                                    className="w-full bg-transparent h-full outline-none text-gray-600"
                                                    name=""
                                                />
                                            </div>
                                            <div className=" flex w-[50%] space-x-2 px-2">
                                                <span
                                                    className=" h-full aspect-square rounded-full text-white 
           bg-orange-500 flex text-[0.7rem] p-1 justify-center items-center"
                                                >
                                                    <FaDollarSign />
                                                </span>
                                                <input
                                                    type="number"
                                                    disabled
                                                    value={
                                                        Number(((Amount * 0.9)).toFixed(2))}
                                                    placeholder="0"
                                                    className="w-full h-full outline-none text-green-600"
                                                    name=""
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* <div className="mt-5">
                                <div className="capitalize font-semibold text-[0.6rem]">
                                    <span className="w-[50%]">
                                        verify with one-time password
                                        &#40;OTP&#41;
                                    </span>
                                </div>
                            </div>
                            <div className="ring-[1.5px] ring-blue-600 pb-2 mt-1 rounded-md">
                                <div className="flex capitalize font-semibold text-[0.65rem] space-x-2 ">
                                    <div className=" flex w-[70%] space-x-1 px-2">
                                        <div className="flex space-x-2 mt-2 flex-row items-center justify-between mx-auto w-full ">
                                            <OtpInputs
                                                otp={otp}
                                                setOtp={setOtp}
                                            />
                                        </div>
                                    </div>
                                    <div className=" flex items-center  flex-col justify-end w-[30%] space-y-2 text-center px-2">
                                        {otpSent !== true ? (
                                            <div
                                                onClick={getOtp}
                                                className="h-[80%] w-full rounded-md flex justify-center items-center text-white capitalize bg-blue-500"
                                            >
                                                Get otp
                                            </div>
                                        ) : (
                                            <>
                                                <span
                                                    className="  
                flex text-[0.7rem] justify-center items-center"
                                                >
                                                    <Image
                                                        src={"/tick_mark.png"}
                                                        alt="sent"
                                                        width={25}
                                                        height={25}
                                                    />
                                                </span>
                                                <div
                                                    onClick={getOtp}
                                                    className="flex text-center justify-center text-xs items-center h-[20%]"
                                                >
                                                    <p>Resend OTP</p>
                                                    <FaPlay />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>  */}
                        </div>

                        <div className="px-2 py-1">
                            <button
                                onClick={withdraw}
                                className="w-full capitalize rounded-md mt-4 shadow-md bg-[#11468F] text-white font-bold py-2 "
                            >
                                transfer to bank
                            </button>
                        </div>
                        <div className="px-2  py-1 space-y-2 mt-3">
                            <div className="flex pl-4 space-x-1">
                                <FaInfoCircle color="red" />
                                <p className=" text-[0.65rem] font-bold">
                                    Withdrawal instruction&apos;s
                                </p>
                            </div>
                            <ol className=" pl-8 text-[0.65rem] list-decimal">
                                <li>
                                    Each placed stake boosts 20% of the wagered
                                    amount. Complete five stakes before
                                    withdrawal. Ensure proper wagering before
                                    proceeding with withdrawal to meet
                                    requirements.
                                </li>
                                <li>
                                    During the specified time frame of 10:00 to
                                    16:00, withdrawals will be processed. Please
                                    note that the bank is closed on Sundays,
                                    hence withdrawals cannot be facilitated on
                                    that day.
                                </li>
                                <li>
                                    Limit to one withdrawal per day according to
                                    company policy.
                                </li>
                                <li>
                                    Please review the membership page for
                                    information regarding your withdrawal
                                    eligibility range.
                                </li>
                                <li>
                                    If you encounter any issues, please don't
                                    hesitate to reach out to our customer
                                    support team for assistance.
                                </li>
                                <li>
                                    Kindly allow a processing time of 24 to 48
                                    hours for withdrawals, as this represents
                                    the maximum limit.
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
                {getVerification && (
                    <VerificationPopup
                        getBankEdit={updateEditBank}
                        verify={verify}
                        otp={otp}
                        setOtp={setOtp}
                        getAlert={getAlert}
                        otpSentTo={
                            verifPhone
                                ? userOtherData?.PhoneNumber
                                : userOtherData?.EmailId
                        }
                        isPhoneVerified={verifPhone}
                        toggleVerification={updateGetVerif}
                    />
                )}
                {editBank &&
                    (isVerified ||
                        !userOtherData?.LocalBankAdded ||
                        !userOtherData?.UsdtBankAdded) && (
                        <AddBank
                            localEditable={
                                isVerified
                                    ? true
                                    : !userOtherData?.LocalBankAdded
                            }
                            usdtEditable={
                                isVerified
                                    ? true
                                    : !userOtherData?.UsdtBankAdded
                            }
                            closePopup={updateEditBank}
                            isUpdatingBank={updating}
                        />
                    )}
            </section>
        </Layout>
    );
}

export default Page;

function VerificationPopup({
    getBankEdit,
    verify,
    isPhoneVerified,
    otp,
    otpSentTo,
    getAlert,
    setOtp,
    toggleVerification,
}) {
    // const [phone, updateVerificationMethod] = useState(true);
    async function editBank() {
        try {
            getAlert();
            let isVerified = await verify();
            if (isVerified) {
                getAlert("success", "otp verified");
                toggleVerification(false);
                getBankEdit(true);
            }
        } catch (error) {
            getAlert("opps", "invalid otp");
        }
    }
    async function getOtp() {
        try {
            getAlert();
            let res = await fetch(
                "/api/otp/" + `${isPhoneVerified ? "phone" : "email"}`
            );
            res = await res.json();
            if (res?.status === 200) {
                getAlert("success", res?.message || "Success");
            } else if (res?.status === 302) {
                getAlert("redirect", res?.message || "session time out");
            } else {
                getAlert("opps", res?.message || "something went wrong");
            }
        } catch (error) {
            getAlert("redirect", res?.message || "something went wrong");
        }
    }
    return (
        <div className="absolute z-[30] top-0 left-0 flex bg-black/50 items-center justify-center right-0 h-full w-full opacity-1">
            <div className=" w-[80%] bg-slate-100 rounded-[1.3rem] px-6 pt-3 pb-4">
                <div className="flex relative flex-col space-y-2">
                    <div className="flex px-2 justify-center">
                        <h4 className="uppercase text-[0.8rem] text-center font-bold">
                            otp verification
                        </h4>
                        <p
                            className="absolute right-0 font-bold text-2xl top-[-0.5rem] pt-2"
                            onClick={() => toggleVerification(false)}
                        >
                            <IoIosClose />
                        </p>
                    </div>
                    <div>
                        <p className="capitalize text-[0.6rem] font-bold">
                            select prefered method for verification
                        </p>
                        <p className="capitalize text-[0.5rem] text-gray-700">
                            to update bank details, please verify with OTP.
                        </p>
                    </div>
                    <div className=" space-y-2  rounded-md  py-2">
                        <div className="flex px-3 py-2  bg-white rounded-md items-center">
                            <div className="flex-[3] capitalize font-semibold text-[0.6rem]">
                                {" "}
                                phone verification
                            </div>
                            <div className="flex-[1] flex justify-end items-center">
                                <input
                                    type="radio"
                                    name="verification"
                                    onChange={() =>
                                        updateVerificationMethod((prev) => prev)
                                    }
                                    checked={isPhoneVerified}
                                    value={"phone"}
                                    className="size-5"
                                    id=""
                                />
                            </div>
                        </div>
                        <div className="flex px-3 py-2  bg-white rounded-md items-center">
                            <div className="flex-[3] capitalize font-semibold text-[0.6rem]">
                                {" "}
                                email verification
                            </div>
                            <div className="flex-[1] flex justify-end items-center">
                                <input
                                    type="radio"
                                    name="verification"
                                    onChange={() =>
                                        updateVerificationMethod((prev) => prev)
                                    }
                                    checked={!isPhoneVerified}
                                    value={"email"}
                                    className="size-5"
                                    id=""
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-start flex flex-col">
                        <span className="uppercase font-regular text-gray-500 text-[0.6rem]">
                            Enter the otp you received on
                        </span>
                        <span className="uppercase font-bold text-xs">
                            {isPhoneVerified
                                ? `+91 ${otpSentTo?.slice(
                                      0,
                                      3
                                  )}*****${otpSentTo?.slice(-3)}`
                                : `${otpSentTo?.slice(
                                      0,
                                      3
                                  )}*****${otpSentTo?.slice(-10)}`}
                        </span>
                    </div>
                    <div className="flex space-x-2 flex-row items-center justify-between mx-auto w-3/4 max-w-xs">
                        <OtpInputs otp={otp} setOtp={setOtp} />
                    </div>
                    <div
                        onClick={getOtp}
                        className="flex flex-row pt-2 items-center text-center text-sm font-medium space-x-1 uppercase text-gray-500"
                    >
                        <a className="flex flex-row items-center font-semibold text-slate-900">
                            Resend
                        </a>
                        <Image
                            src={"/play.png"}
                            alt="play "
                            width={12}
                            height={12}
                        ></Image>
                    </div>

                    <div className="flex flex-col pt-4">
                        <div>
                            <button
                                onClick={editBank}
                                className="flex flex-row items-center justify-center text-center w-full  font-bold tracking-wide text-md rounded-md outline-none py-4 bg-blue-500 border-none text-white text-sm uppercase  shadow-sm"
                            >
                                edit bank details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

async function validateTime() {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
    const currentHour = currentDate.getHours();

    // Check if it's Saturday (6) or Sunday (0) - withdrawals are off on weekends
    if (currentDay === 0 || currentDay === 6) {
        return false;
    }

    // Check if outside the working hours (10 am to 4 pm)
    if (currentHour < 10 || currentHour >= 16) {
        return false;
    }

    return true;
}
