"use client";
export const maxDuration = 50;

import CommissionPopModel from "@/app/components/CommissionPopModel";
import Layout from "@/app/components/Layout";
import Back from "@/app/components/LiveChats/Back";
import Loading from "@/app/components/Loading";
import { AlertContext } from "@/app/helpers/AlertContext";
import { Copy } from "@/app/helpers/Copy";
import { UserContext } from "@/app/helpers/UserContext";
import { motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { FaInfo, FaLink } from "react-icons/fa6";
import { LiaAngleRightSolid, LiaAngleUpSolid } from "react-icons/lia";
import { MdOutlineContentCopy, MdOutlineShare } from "react-icons/md";

const Page = () => {
    let { getAlert } = useContext(AlertContext);
    const [infoModel, updateInfoModel] = useState(false);
    const [claimModel, updateclaimModel] = useState(false);
    const [isShairing, updateShairing] = useState(true);
    const [getCommissionPop, updateCommissionPop] = useState(false);
    const [popupType, updatePopupType] = useState("");
    const [todayCommission, updateTodayCommission] = useState([]);
    const [overallCommission, updateOverallCommission] = useState([]);
    const [weekCommission, updateWeeklyCommission] = useState([]);
    const [total_deposit, updateTotalDeposit] = useState(0);
    const [today_deposit, updateTodayDeposit] = useState(0);
    const [total_withdrawal, updateTotalWithdrawal] = useState(0);
    const [commissionData, updateCommissionData] = useState(0);
    const { userBalance, userOtherData, getBalance } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [activeUsers, updateActiveUsers] = useState(0);

    const [RegisterData, updateRegisterData] = useState({
        level1: [],
        level2: [],
        level3: [],
    });
    const [TransactionData, updateTransactionData] = useState({
        level1: [],
        level2: [],
        level3: [],
    });

    const [loadedOnce, updateLoaded] = useState(false);
    const [usersJoinedToday, updateUserJoinedToday] = useState(0);

    // functioni will get the commission popup which will show data of users like deposit withdrawal and register;
    function getPopup(type) {
        updatePopupType(type);
        updateCommissionPop(true);
    }

    async function getCommissionData() {
        try {
            let res = await fetch("/api/profile/commission");
            let today = new Date();
            let date = `${today?.getDate()}/${
                today?.getMonth() + 1
            }/${today?.getFullYear()}`;
            let weeklyCommission = [];
            res = await res.json();
            if (res.status === 200) {
                setLoading(false);
                let commissionObj = res?.data[0];
                updateTodayCommission(commissionObj[date]);
                updateCommissionData(() => {
                    let total = 0;
                    if (commissionObj.hasOwnProperty(date)) {
                        for (let data of commissionObj[date]) {
                            total += Number(data?.Commission) / 100;
                        }
                        return total.toFixed(2);
                    }
                });
                updateOverallCommission(() => {
                    let overall_obj = [];
                    for (let key in commissionObj) {
                        if (commissionObj.hasOwnProperty(key)) {
                            let todayCommission = 0;
                            for (let commission of commissionObj[key]) {
                                todayCommission +=
                                    Number(commission.Commission) / 100;
                            }
                            weeklyCommission.unshift(todayCommission);
                            if (key !== date) {
                                overall_obj.push(...commissionObj[key]);
                            }
                        }
                    }
                    return overall_obj;
                });
                updateWeeklyCommission(weeklyCommission);
            } else {
                getAlert("redirect", "something went wrong login again");
            }
        } catch (error) {
            getAlert("opps", "slow internet detected");
        }
    }
    async function getTransactionData() {
        let res = await fetch("/api/profile/transactions");
        if (res.ok) {
            res = await res.json();
            if (res?.status === 200) {
                let {
                    level1_transactions,
                    level2_transactions,
                    level3_transactions,
                    total_deposit,
                    today_deposit,
                    total_withdrawal,
                } = res?.data;
                updateTotalDeposit(total_deposit);
                updateTotalWithdrawal(total_withdrawal);
                updateTodayDeposit(today_deposit)
                updateTransactionData({
                    level1: level1_transactions,
                    level2: level2_transactions,
                    level3: level3_transactions,
                });
            } else {
                getAlert("redirect", "something went wrong login again");
            }
        }
    }
    async function getRegisterData() {
        let res = await fetch("/api/profile/register");
        if (res.ok) {
            res = await res.json();
            if (res?.status === 200) {
                let {
                    level1_users,
                    level2_users,
                    level3_users,
                    joinedToday,
                    active_users,
                } = res?.data;
                updateRegisterData({
                    level1: level1_users,
                    level2: level2_users,
                    level3: level3_users,
                });
                updateActiveUsers(active_users);
                updateUserJoinedToday(joinedToday);
            } else {
                getAlert("redirect", "something went wrong login again");
            }
        }
    }

    async function claimCommission() {
        try {
            getAlert();
            let config = {
                method: "POST",
                header: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({}),
            };
            let res = await fetch("/api/profile/commission", config);
            res = await res.json();
            if (res?.status === 200) {
                await getBalance();
                getAlert("success", res?.message);
            } else if (res?.status === 302 || res?.status === 500) {
                getAlert("redirect", "something went wrong login again");
            } else {
                getAlert("opps", res?.message || "something went wrong");
            }
        } catch (error) {
            getAlert("redirect", "something went wrong login again");
        }
    }

    useEffect(() => {
        if (!loadedOnce) {
            getCommissionData();
            getRegisterData();
            getTransactionData();
            updateLoaded(true);
        }
    }, [RegisterData, TransactionData, commissionData]);

    const [invitationLink, setInvitationLink] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setInvitationLink(
                `${window.location.origin}/access/signup?id=${userOtherData?.InvitationCode}`
            );
        }
    }, [userOtherData?.InvitationCode]);

    return (
        <Layout>
            <section className=" bg-[#F8FCFF] w-full relative h-[100dvh]">
                <Back page={"commission center"} />
                <main className=" space-y-1  h-fit px-4 ">
                    {/* hero section */}
                    <div
                        style={{
                            background: "url(/profileBg.jpg) center no-repeat",
                            backgroundSize: "cover",
                        }}
                        className=" h-[65%] py-4 pb-7 ring-[0.2px] ring-gray-600 w-full relative 
       rounded-[25px] "
                    >
                        <div className="flex flex-col w-full mt-2 justify-center items-center py-3">
                            <span
                                className="
               relative text-gray-500 font-bold rounded-full capitalize text-sm text-center "
                            >
                                <h2>Total commission</h2>
                                <h2>Earned from members</h2>
                            </span>
                            <span className="flex items-center text-4xl mt-4 text-white space-x-1">
                                <h2>
                                    <FaRupeeSign />
                                </h2>
                                <h2 className="capitalize  truncate font-bold ">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "decimal",
                                        maximumFractionDigits: 2,
                                    }).format(
                                        Number(userOtherData?.Commission) /
                                            100 || 0
                                    )}
                                </h2>
                            </span>
                        </div>
                        <div
                            // onClick={() => updateShairing((prev) => !prev)}
                            className="absolute flex justify-center items-center text-3xl text-white -bottom-6 rounded-full left-[50%] translate-x-[-50%] size-12 bg-[#333333]"
                        >
                            <MdOutlineShare />
                        </div>
                        <div className="absolute flex items-center space-x-2 top-4 left-4 ">
                            <div
                                onClick={() => updateInfoModel((prev) => !prev)}
                                className="rounded-full flex justify-center items-center size-8 bg-red-500/80 text-white"
                            >
                                <FaInfo />
                            </div>
                            {infoModel && (
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className=" normal-case flex flex-col text-gray-800 py-1 px-2 text-[0.4rem] bg-white rounded-md h-full w-fit font-bold"
                                >
                                    <span>
                                        Total commission earned from your
                                        friends:
                                    </span>
                                    <span>
                                        Calculating the sum of commissions
                                        accumulated through
                                    </span>
                                    <span>
                                        referrals from your acquaintances.
                                    </span>
                                </motion.p>
                            )}
                        </div>
                    </div>
                    {isShairing && (
                        <div className="pt-8 px-2">
                            <p className="capitalize text-[0.65rem] font-bold">
                                invite link
                            </p>
                            <div className="flex items-center py-2 justify-center ring-[#11468F]  rounded-md ring-[1.7px]">
                                <span className="w-[10%] flex justify-center items-center text-blue-500">
                                    <FaLink />
                                </span>
                                <p className=" w-[80%] text-gray-600 truncate text-[0.6rem] px-1 rounded-md">
                                    {invitationLink}
                                </p>
                                <span
                                    onClick={async (e) => {
                                        let isCopied = await Copy(
                                            invitationLink
                                        );
                                        getAlert(
                                            isCopied ? "success" : "opps",
                                            isCopied
                                                ? "Invitation link copied successfully."
                                                : "unable to copy the text please try to copy it manually"
                                        );
                                    }}
                                    className="w-[10%] flex justify-center items-center text-blue-500"
                                >
                                    <MdOutlineContentCopy />
                                </span>
                            </div>
                            <p className="capitalize text-[0.65rem] font-bold mt-3">
                                invite code
                            </p>
                            <div className="flex items-center py-2 justify-center ring-[#11468F]  rounded-md ring-[1.7px]">
                                <span className="w-[10%] flex justify-center items-center text-blue-500">
                                    <FaLink />
                                </span>
                                <p className=" w-[80%] capitalize text-gray-600 truncate text-[0.6rem] px-1 rounded-md">
                                    <span>invite code - </span>
                                    <span className="text-blue-500">
                                        {userOtherData?.InvitationCode}
                                    </span>
                                </p>
                                <span
                                    onClick={async (e) => {
                                        let isCopied = await Copy(
                                            userOtherData?.InvitationCode || "0"
                                        );
                                        getAlert(
                                            isCopied ? "success" : "opps",
                                            isCopied
                                                ? "Invitation code copied successfully."
                                                : "unable to copy the text please try to copy it manually"
                                        );
                                    }}
                                    className="w-[10%] flex justify-center items-center text-blue-500"
                                >
                                    <MdOutlineContentCopy />
                                </span>
                            </div>
                        </div>
                    )}
                </main>
                <div className="mt-4 px-6 flex gap-x-3">
                    <div className="h-full pl-2 w-fit text-nowrap text-[0.6rem] font-semibold capitalize ">
                        Today&apos;s deposit
                    </div>
                    <div className="h-full  w-full capitalize font-bold text-[0.6rem] text-gray-400 ">
                        <h2>{today_deposit || 0} today&apos; deposit</h2>
                    </div>
                </div>
                <div
                    className={`${
                        isShairing ? " h-[30%]" : " h-[60%] mt-10 "
                    }  shadow-gray-900 rounded-t-[1.5rem]`}
                >
                    <div className="h-full overflow-y-scroll pb-40 px-4">
                        {/* claim button */}
                        <div
                            onClick={() => getPopup("deposit")}
                            style={{
                                boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.1) ",
                            }}
                            className="shadow-md flex mt-3 items-center py-[0.7rem] bg-[#FFF]  rounded-2xl  px-2"
                        >
                            <div className="h-full pl-2  w-full flex text-[0.6rem] font-semibold capitalize  items-center flex-[2]">
                                Total deposit
                            </div>
                            <div className="h-full  w-full flex-[2] capitalize font-bold text-[0.6rem] text-gray-400 flex items-center justify-between">
                                <h2>{total_deposit || 0} total deposit</h2>
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <div className="p-1 rounded-full bg-gray-200 text-sm">
                                    <LiaAngleRightSolid />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => getPopup("withdrawal")}
                            style={{
                                boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.1) ",
                            }}
                            className="shadow-md flex mt-3 items-center py-[0.7rem] bg-[#FFF] rounded-2xl  px-2"
                        >
                            <div className="h-full pl-2  w-full flex text-[0.6rem] font-semibold capitalize  items-center flex-[2]">
                                total withdrawal
                            </div>
                            <div className="h-full  w-full flex-[2] capitalize font-bold text-[0.6rem] text-gray-400 flex items-center justify-between">
                                <h2>
                                    {total_withdrawal || 0} total withdrawal
                                </h2>
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <div className="p-1 rounded-full bg-gray-200 text-sm">
                                    <LiaAngleRightSolid />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => getPopup("commission")}
                            style={{
                                boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.1) ",
                            }}
                            className="shadow-md flex mt-3 items-center py-[.7rem] bg-white  rounded-2xl  px-2"
                        >
                            <div className="h-full pl-2  w-full flex text-[0.6rem] font-semibold capitalize  items-center flex-[2]">
                                today&apos;s commission
                            </div>
                            <div className="h-full  w-full flex-[2] capitalize font-bold text-[0.6rem] text-gray-400 flex items-center justify-between">
                                <h2>{commissionData} today commission</h2>
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <div className="p-1 rounded-full bg-gray-200 text-sm">
                                    <LiaAngleRightSolid />
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => getPopup("register")}
                            style={{
                                boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.1) ",
                            }}
                            className="shadow-md flex mt-3 items-center py-[.7rem]  rounded-2xl bg-white  px-2"
                        >
                            <div className="h-full pl-2  w-full flex text-[0.6rem] font-semibold capitalize  items-center flex-[2]">
                                new register
                            </div>
                            <div className="h-full  w-full flex-[2] capitalize font-bold text-[0.6rem] text-gray-400 flex items-center justify-between">
                                <h2>{usersJoinedToday} new members joined</h2>
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <div className="p-1 rounded-full bg-gray-200 text-sm">
                                    <LiaAngleRightSolid />
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                boxShadow: "0px 5px 15px 0px rgba(0,0,0,0.1) ",
                            }}
                            className="shadow-md flex mt-3 items-center py-[.7rem]  rounded-2xl bg-white  px-2"
                        >
                            <div className="h-full pl-2  w-full flex text-[0.6rem] font-semibold capitalize  items-center flex-[2]">
                                active members
                            </div>
                            <div className="h-full  w-full flex-[2] capitalize font-bold text-[0.6rem] text-gray-400 flex items-center justify-between">
                                <h2>{activeUsers} active members</h2>
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <div className="p-1 rounded-full bg-green-300 text-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* commission popups */}
                {getCommissionPop && popupType === "commission" && (
                    <section className="absolute top-0 left-0 h-full w-full bg-slate-50">
                        <CommissionPopModel
                            type={popupType}
                            todayCommission={todayCommission}
                            overallCommission={overallCommission}
                            closeModel={updateCommissionPop}
                        />
                    </section>
                )}
                {getCommissionPop && popupType === "register" && (
                    <section className="absolute top-0 left-0 h-full w-full bg-slate-50">
                        <CommissionPopModel
                            type={popupType}
                            level1={RegisterData?.level1 || []}
                            level2={RegisterData?.level2 || []}
                            level3={RegisterData?.level3 || []}
                            closeModel={updateCommissionPop}
                        />
                    </section>
                )}
                {getCommissionPop &&
                    (popupType === "deposit" || popupType === "withdrawal") && (
                        <section className="absolute top-0 left-0 h-full w-full bg-slate-50">
                            <CommissionPopModel
                                type={popupType}
                                level1={TransactionData?.level1 || []}
                                level2={TransactionData?.level2 || []}
                                level3={TransactionData?.level3 || []}
                                closeModel={updateCommissionPop}
                            />
                        </section>
                    )}

                {/* loading component here */}
                {loading && <Loading />}
            </section>
        </Layout>
    );
};

export default Page;
