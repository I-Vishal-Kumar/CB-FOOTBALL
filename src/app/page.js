"use client";

import Image from "next/image";
import { FaCirclePlus, FaLock } from "react-icons/fa6";
import MatchCard2 from "./components/MatchCard2";
import { useContext, useState, useEffect } from "react";
import { IoIosAdd, IoIosArrowForward } from "react-icons/io";
import { FaRupeeSign,  FaTelegramPlane, FaWhatsapp  } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Layout from "./components/Layout";
import { UserContext } from "./helpers/UserContext";
import { motion } from "framer-motion";
import { AlertContext } from "./helpers/AlertContext";
import DemoCarousel from "./components/DemoCarousel";
import Link from "next/link";
import PlaceBet from "./components/PlaceBet";

export default function Home() {
    let router = useRouter();
    const { userBalance, userOtherData, getBalance } = useContext(UserContext);
    const [balance, updateBalance] = useState(0);
    const [matches, updateMatches] = useState([]);
    const [matchLoaded, updateLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    // states for access current data and popup handling //
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    // event handlers for the popup and accesing current data //
    const handleMatchCardClick = (isOpen, item) => {
        // MatchCard2 passes (true, data), so use the second parameter (item) as the match data
        // If only one parameter is passed (backward compatibility), use it as the match data
        const matchData = item !== undefined ? item : isOpen;
        setSelectedMatch(matchData);
        setPopupVisible(true);
    };

    const closePopup = () => {
        setPopupVisible(false);
    };

    async function getLiveMatches() {
        try {
            let res = await fetch(`/api/home`);
            if (!res.ok) throw new Error("Error while fetching matches");
            res = await res.json();
            if (res?.status === 200) {
                updateMatches(res?.data?.matches);
                setLoading(false); // Set loading to false when data is fetched
            } else {
                setLoading(false);
                throw new Error("Somethign went wrong");
            }
        } catch (error) {
            setLoading(false); // Handle errors and set loading to false
            router.push("/access/login");
        }
    }

    const [user, setUser] = useState();
    const randomUser = () => {
        let users = Math.floor(Math.random() * 10000000);
        setUser(users);
    };

    useEffect(() => {
        if (userBalance) {
            updateBalance(userBalance);
        } else {
            getBalance();
        }
    }, [userBalance]);

    useEffect(() => {
        if (!matchLoaded) {
            getLiveMatches();
            updateLoaded(true);
            setLoading(false);
        }
        randomUser();
    }, [matchLoaded]);

    const gradients = [
        {
            id: 1,
            bgColor:
                "linear-gradient(138deg, rgba(255,210,210,1) 0%, rgba(255,255,255,1) 50%, rgba(255,210,210,1) 100%)",
            start: "#FCDDBC",
            stop: "#f71b1b",
        },
        {
            id: 2,
            bgColor:
                "linear-gradient(138deg, rgba(199,255,199,1) 0%, rgba(255,255,255,1) 50%, rgba(199,255,199,1) 100%)",
            start: "#f7fff7",
            stop: "#1aff1a",
        },
        {
            id: 3,
            bgColor:
                "linear-gradient(138deg, rgba(255,197,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,197,255,1) 100%)",
            start: "#ffedff",
            stop: "#ff14ff",
        },
        {
            id: 4,
            bgColor:
                "linear-gradient(138deg, rgba(255,225,195,1) 0%, rgba(255,255,255,1) 50%, rgba(255,225,195,1) 100%)",
            start: "#fff9f4",
            stop: "#ff8b17",
        },
        {
            id: 5,
            bgColor:
                "linear-gradient(138deg, rgba(255,255,205,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,205,1) 100%)",
            start: "#fffff0",
            stop: "#ffff17",
        },
        {
            id: 6,
            bgColor:
                "linear-gradient(138deg, rgba(223,255,190,1) 0%, rgba(255,255,255,1) 50%, rgba(223,255,190,1) 100%)",
            start: "#f7ffef",
            stop: "#8dff17",
        },
        {
            id: 7,
            bgColor:
                "linear-gradient(138deg, rgba(215,255,254,1) 0%, rgba(255,255,255,1) 50%, rgba(215,255,254,1) 100%)",
            start: "#fdffff",
            stop: "#00ffff",
        },
    ];

    const getRandomGradient = () => {
        const randomIndex = Math.floor(Math.random() * gradients.length);
        return gradients[randomIndex];
    };

    const [isDepositVissible, showPopup] = useState(false);
    const [landingPopup, setLandingPopup] = useState(true);
    useEffect(()=>{
       const timeOut =  setTimeout(()=>{
            setLandingPopup(false);
            updateLoaded(true);
        }, 1000 * 5);
        return ()=>{
            if(timeOut) clearTimeout(timeOut);
        }
    }, []);
    return (
        <Layout>
            <main className="h-screen relative bg-no-repeat bg- bg-center bg-gradient-to-b from-[#11468F] to-[#00000063] overflow-hidden flex flex-col  ">
                <div className="  flex justify-between place-items-center  w-[90%] mr-auto ml-auto   ">
                    <div className="w-max mt-2 flex flex-col justify-center  pt-2 ">
                        <div
                            onClick={() => {
                                router.push("/profile/recharge");
                            }}
                            className=" flex place-items-center h-6 rounded-full bg-white w-max line-clamp-1 text-ellipsis   "
                        >
                            <span className="flex items-center   line-clamp-1 text-ellipsis text-[.65rem] font-bold px-2  min-w-[4rem] ">
                                <FaRupeeSign />
                                {Number(userBalance?.toFixed(2)) || 0}
                            </span>
                            <FaCirclePlus className="text-[.9rem] mr-2 text-[#333333] " />
                        </div>

                        <h1 className=" font-extrabold text-[1.3rem] text-[white] mt-3 text-center  ">
                            Top Events
                        </h1>
                    </div>

                    <div className="flex place-items-center">
                        <span className=" mt-1 leading-3 mr-1 text-white ">
                            <p className="w-[8rem] flex flex-col items-end  text-right overflow-hidden   break-words  ">
                                <span className="text-[.9rem] font-semibold w-[90%] text-right ">
                                    Welcome Back
                                </span>
                                <span className="text-[.7rem] font-[500] w-[4rem] overflow-ellipsis line-clamp-1 ">
                                    {" "}
                                    {userOtherData?.UserName || "name"}{" "}
                                </span>
                            </p>
                        </span>
                        <div className="h-[3.3rem] w-[3.3rem] flex justify-center place-items-center rounded-full bg-white ">
                            <Image
                                src={"/logo.png"}
                                alt="logo"
                                width={35}
                                height={35}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-[28%]  w-[95%] mr-auto ml-auto mt-1 mb-[2rem] ">
                    <DemoCarousel />
                </div>

                <div className="flex-1 bg-white mt-[1rem] rounded-t-[30px] overflow-hidden shadow-2xl shadow-black flex flex-col min-h-0">
                    <div className="overflow-y-scroll flex-1 min-h-0">
                        {matches && matches.length > 0 ? (
                            matches.map((match, index) => (
                                <MatchCard2
                                    key={match?.StakeId || index}
                                    data={match}
                                    placeBet={handleMatchCardClick}
                                />
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-500">No matches available</p>
                            </div>
                        )}
                    </div>

                    {popupVisible && (
                        <MatchPopup
                            match={selectedMatch}
                            onClose={closePopup}
                        />
                    )}
                    {/* {isDepositVissible && (
                        <div
                            onClick={() => showPopup(false)}
                            className="absolute flex justify-center items-center z-10 top-0 left-0 h-full w-full bg-black/40"
                        >
                            <FixedDeposit
                                closePopup={showPopup}
                                userBalance={userBalance}
                            />
                        </div>
                    )} */}
                </div>

                {/* loading component here */}
                {/* {loading && <Loading />} */}
                {/* popup */}
                {
                    landingPopup && (
                        <section onClick={()=>setLandingPopup(false)} className="h-full w-full flex justify-center items-center bg-gray-600/50 absolute top-0 left-0 z-20" >
                             <div onClick={(e)=>e.stopPropagation()} className="bg-white rounded-md py-20 w-[90%] flex flex-col items-center justify-center space-y-4 p-4">
                                <Link href={'https://t.me/Bharat_Goal'}>
                                    <button
                                        className="flex items-center justify-center w-full py-2 px-4 rounded-md text-white bg-[#0088cc] hover:bg-[#0078b5] transition duration-200">
                                        <FaTelegramPlane className="mr-2" size={20} />
                                        Join Telegram
                                    </button>
                                </Link>
                                <Link href={'https://chat.whatsapp.com/KEpfmtfDaN46mvbxScdGWT'}>
                                    <button className="flex items-center justify-center w-full py-2 px-4 rounded-md text-white bg-[#25D366] hover:bg-[#1ebc5c] transition duration-200">
                                        <FaWhatsapp className="mr-2" size={20} />
                                        Join WhatsApp
                                    </button>
                                </Link>
                                <a
                                    // download={"cb-football.apk"}
                                    // href={"/downloads/cb-football.apk"}
                                    style={{
                                        boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                                    }}
                                    className="flex  items-center py-3  rounded-[19px] bg-[#fff]  px-2"
                                >
                                    <button className="flex items-center justify-center w-full py-2 px-4 rounded-md text-white bg-[#11468F] hover:bg-[#215aab] transition duration-200">
                                        Download apk
                                    </button>
                            </a>
                            </div>
                        </section>
                    )
                }
            </main>
        </Layout>
    );
}

function MatchPopup({ match, onClose }) {
    return (
        <PlaceBet 
            data={match} 
            togglePopup={onClose} 
        />
    );
}

function ScoreCards({
    placeBet,
    percent,
    Balance,
    Score_a,
    Score_b,
    disabled,
    style,
}) {
    const [estimatedIncome, updateEstimated] = useState(0);
    const [betAmount, updateBetAmount] = useState(0);

    function updateAmount(amount) {
        updateBetAmount(amount);
        updateEstimated(() => {
            let estimated = ((Number(amount) / 100) * Number(percent)).toFixed(
                2
            );
            return Math.abs(
                Number(estimated) - (Number(estimated) / 100) * 5
            ).toFixed(2);
        });
    }


    let router = useRouter();

    return (
        <div className="w-[100%] ">
            <div
                style={{
                    gridTemplateColumns: "1fr 2fr 1fr",
                    boxShadow: "0 4px 4px rgb(0,0,0,0.1)",
                }}
                className=" mt-[1rem] rounded-xl bg-[#F8FCFF]  w-[100%] flex justify-around text-[.65rem]  font-semibold   h-[3rem] place-items-center  "
            >
                <span
                    className="flex items-center justify-center 
        "
                >
                    Score{" "}
                    <h2 className="ml-1 text-red-500 ">
                        {" "}
                        {Score_a}-{Score_b}{" "}
                    </h2>
                </span>
                <span className="flex items-center">
                    Odds percentage -<h2 className=" ml-1 text-green-400"></h2>
                    <h2 className="text-green-400"> {percent} </h2>
                </span>
                <span className="flex items-center justify-center py-2 px-2 bg-[#11468F] text-white rounded-[7px] ">
                    Place stake
                </span>
            </div>

            <div className="space-y-4 mt-3 px-2">
                <div className="flex justify-between ">
                    <span className=" text-[0.65rem] text-gray-600 font-bold">
                        Handling fee 5%
                    </span>
                    <div
                        onClick={() => {
                            router.push("/profile/recharge");
                        }}
                        className=" rounded-full py-0.5 ring-1 ring-gray-600/30 px-1 w-fit bg-white space-x-1 flex justify-center items-center"
                    >
                        <div className="flex pl-1 justify-center items-center h-[90%] space-x-1">
                            <span
                                className=" h-full aspect-square rounded-full text-white 
             bg-[#333333] flex text-[0.5rem] justify-center items-center"
                            >
                                <FaRupeeSign />
                            </span>

                            <span
                                onClick={() => router.push("/profile/recharge")}
                                className="text-xs font-bold pr-3"
                            >
                                {new Intl.NumberFormat().format(Balance || 0)}
                            </span>
                        </div>
                        <span className="h-[90%] font-bolder text-white aspect-square rounded-full bg-[#333333] flex justify-center items-center">
                            <IoIosAdd />
                        </span>
                    </div>
                </div>

                <div className="grid px-0 ">
                    <span className="grid grid-cols-2">
                        <h2 className="text-[0.65rem]  font-bold capitalize ">
                            stake amount
                        </h2>
                        <h2 className="text-[0.65rem] pl-1 font-bold capitalize ">
                            estimated amount
                        </h2>
                    </span>

                    <div
                        className="flex ring-2 px-1 ring-[#11468F]
           mt-1 py-1 rounded-md items-center"
                    >
                        <div className="flex pl-1 space-x-1 max-w-[50%] min-w-[50%]  items-center h-[90%]">
                            <span
                                className=" h-[80%] aspect-square rounded-full text-white 
             bg-[#333333] flex text-[0.65rem] justify-center items-center"
                            >
                                <FaRupeeSign />
                            </span>
                            <input
                                type="number"
                                className="focus:outline-none h-8 w-[80%] border-none bg-transparent outline-none "
                                placeholder="Add"
                                name=""
                                id=""
                                onChange={(e) => updateAmount(e.target.value)}
                                value={betAmount}
                            />
                        </div>
                        <div className="flex pl-1 min-w-[50%] space-x-2  items-center h-[90%] ">
                            <span
                                className=" h-[80%] aspect-square rounded-full text-white 
             bg-green-400 text-[0.65rem] flex justify-center items-center"
                            >
                                <FaRupeeSign />
                            </span>

                            <span className="text-xs font-bold text-green-500 pr-3">
                                {estimatedIncome || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => updateAmount(Balance)}
                        className="py-2 px-1 font-bold w-[30%] text-sm text-white rounded-md capitalize bg-gray-900"
                    >
                        all amount
                    </button>
                    <button
                        onClick={() =>
                            placeBet(percent, Score_a, Score_b, betAmount)
                        }
                        disabled={disabled}
                        style={{
                            backgroundColor: disabled ? "#5A5A5A" : "#11468F",
                        }}
                        className="py-2 px-2 w-[70%] bg-[#11468F] font-bold text-sm text-white rounded-md capitalize"
                    >
                        confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

function FixedDeposit({ userBalance, closePopup }) {
    const router = useRouter();
    const [selectDuration, updateDuration] = useState(30);
    const { getBalance } = useContext(UserContext);
    const [amount, updateAmount] = useState();
    let { getAlert } = useContext(AlertContext);
    const Percent = {
        30: 1.5,
        60: 2.5,
        90: 3.5,
    };

    const calculateCompoundInterest = (principal, rate, time) => {
        if (!principal || !rate || !time) return 0;
        return Intl.NumberFormat().format(
            (principal * Math.pow(1 + rate / 100, time)).toFixed(2)
        );
    };

    const handleSubmit = async () => {
        const percent = Percent[selectDuration];

        getAlert();

        if (!amount || !percent) return getAlert("opps", "choose some amount");
        if (amount < 500) return getAlert('opps', 'Minimum F.D. amount is 500.')
        
        const response = await fetch("/api/fixedDeposit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ percent, amount, duration: selectDuration }),
        });
        const res = await response.json();
        if (res?.status === 200) {
            getAlert("success", res.message);
            await getBalance();
            closePopup(false);
        } else if (res?.status === 302) {
            getAlert("redirect", res.message);
        } else {
            getAlert("opps", res.message || "something went wrong");
        }
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-white rounded-2xl"
        >
            <div
                onClick={() => {
                    router.push("/profile/recharge");
                }}
                className=" gap-6 relative flex justify-between overflow-visible place-items-center h-6 rounded-full bg-white w-full line-clamp-1 text-ellipsis   "
            >
                <span className="flex items-center line-clamp-1 text-ellipsis text-[.65rem] font-bold px-2 ">
                    <FaRupeeSign />
                    {Number(userBalance?.toFixed(2)) || 0}
                </span>

                <FaCirclePlus className="text-[3rem] mr-2 text-[#333333] " />
                <div className="flex items-center">
                    <span className="text-sm">Recharge</span>
                    <IoIosArrowForward />
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-1 text-white grid-rows-2">
                <button
                    onClick={() => updateAmount(500)}
                    className="bg-gray-600 rounded-md"
                >
                    500
                </button>
                <button
                    onClick={() => updateAmount(1000)}
                    className="bg-gray-600 rounded-md"
                >
                    1000
                </button>
                <button
                    onClick={() => updateAmount(1500)}
                    className="bg-gray-600 rounded-md"
                >
                    1500
                </button>
                <button
                    onClick={() => updateAmount(2000)}
                    className="bg-gray-600 rounded-md"
                >
                    2000
                </button>
            </div>
            <div className="py-4 mt-2 flex flex-col gap-4">
                <input
                    className="py-2 px-4 w-full border-[#11468F] border-2 text-gray-900 rounded-md"
                    type="number"
                    value={amount}
                    onChange={(e) => updateAmount(e.target.value)}
                    placeholder="Enter amount"
                />
                <select
                    className="py-2 px-3 border-[#11468F] border-2 rounded-md"
                    value={selectDuration}
                    onChange={(e) => updateDuration(e.target.value)}
                >
                    <option value={30}>30 days @1.5%</option>
                    <option value={60}>60 days @2.5%</option>
                    <option value={90}>90 days @3.5%</option>
                </select>
            </div>
            <div className="pb-3 px-1 text-sm">
                <span>
                    F.D. return ={" "}
                    {calculateCompoundInterest(
                        amount,
                        Percent[selectDuration],
                        selectDuration
                    )}
                </span>
            </div>
            <div
                onClick={handleSubmit}
                className="text-center bg-[#11468F] rounded-md py-2 text-white"
            >
                <button>Create fixed deposit</button>
            </div>
        </div>
    );
}
// HOW TO USE THE COPY BUTTON

// onClick={async (e) => {
//   let isCopied = await Copy("TEXT"); //  returns true if successful
//   getAlert(
//     isCopied ? "success" : "opps",
//     isCopied
//       ? "Invitation link copied successfully."
//       : "unable to copy the text please try to copy it manually"
//   );
// }}
