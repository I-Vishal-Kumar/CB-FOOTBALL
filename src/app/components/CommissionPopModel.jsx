"use client";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { motion } from "framer-motion";
import Image from "next/image";

function CommissionPopModel({
    type,
    todayCommission,
    overallCommission,
    level1,
    level2,
    level3,
    closeModel,
}) {
    const [selectedLevel, updateLevel] = useState(1);
    const [childrens, updateChildrens] = useState(0);
    const [today, updateToday] = useState("0/0/2024");
    const dataBox = useRef();
    const noData = useRef();
    const [swipe, setSwipe] = useState(1);
    const [searchKey, updateSearchKey] = useState("");

    useEffect(() => {
        let today = new Date();
        let date = `${today?.getDate()}/${
            today?.getMonth() + 1
        }/${today?.getFullYear()}`;
        updateToday(date);
    }, []);

    useEffect(() => {
        if (dataBox?.current && noData?.current) {
            let toExclue = noData?.current;
            let childrens = Array.from(dataBox?.current?.children);
            const filteredList = childrens.filter(
                (child) => child !== toExclue
            );
            updateChildrens(filteredList?.length);
        }
    }, [swipe, dataBox?.current?.children, searchKey, selectedLevel]);

    return (
        <div className="h-screen w-screen overflow-y-hidden bg-[#F8FCFF] ">
            <div className="py-[1rem] h-[10%] ">
                <div className="grid grid-flow-col grid-cols-3  place-items-center">
                    <span
                        onClick={() => closeModel(false)}
                        className="flex place-items-center justify-self-start p-[0.5rem]"
                    >
                        <IoIosArrowBack className="text-[0.8rem]   " />
                        <div className="text-[.7rem] font-medium ">Back</div>
                    </span>
                    <div className="flex place-items-center justify-self-center">
                        <span className="font-bold text-[0.8rem] capitalize ">
                            new {type}
                        </span>
                    </div>
                    <span></span>
                </div>
            </div>

            {/* toggler */}
            <div className="h-fit">
                <div className=" h-[60px] w-[90%] flex mr-auto ml-auto rounded-[10px] relative  bg-[#e8e8e8] ">
                    <div
                        onClick={() => setSwipe(1)}
                        className={`flex-[1] z-[3] flex justify-center items-center text-sm capitalize ${
                            swipe === 1 ? " font-bold " : "  "
                        }`}
                    >
                        today
                    </div>
                    <div
                        onClick={() => setSwipe(2)}
                        className={`flex-[1] z-[3] flex justify-center items-center text-sm capitalize ${
                            swipe === 3 ? " font-bold " : "  "
                        }`}
                    >
                        overall
                    </div>
                    {/* toggler */}
                    <div className="h-full grid grid-cols-2 justify-center w-full absolute top-0 p-1">
                        <div
                            style={{ gridColumnStart: swipe }}
                            className={`col-span-1 rounded-md   bg-white z-[1]`}
                        ></div>
                    </div>
                </div>
            </div>

            <div className=" h-[80%]  relative ">
                <div className="relative px-4  h-[10%] flex items-center ">
                    <input
                        type="text"
                        name=""
                        style={{
                            boxShadow: "0px 8px 15px 0px rgba(0,0,0,0.1) ",
                        }}
                        className="text-center px-4 rounded-full py-1.5 outline-none
              shadow-gray-500
            border-none bg-white w-full"
                        placeholder="Search Username"
                        value={searchKey}
                        onChange={(e) => updateSearchKey(e.target.value)}
                    />
                    <div className="absolute left-4 top-0 h-full flex justify-center items-center aspect-square ">
                        <Image
                            src="/search.png"
                            alt="logo"
                            height={25}
                            width={25}
                        ></Image>
                    </div>
                </div>
                {type !== "commission" ? (
                    <div className="relative px-4 h-[10%] flex items-center justify-evenly ">
                        <div className="flex shadow-sm items-center bg-white space-x-3 py-2 px-3 text-sm font-bold rounded-md">
                            <div>level 1</div>
                            <input
                                type="radio"
                                checked={selectedLevel === 1}
                                onChange={() => updateLevel(1)}
                                className="text-blue-500  size-5 radio-primary outline-blue-400"
                                name="level"
                            />
                        </div>
                        <div className="flex shadow-sm items-center bg-white space-x-3 py-2 px-3 text-sm font-bold rounded-md">
                            <div>level 2</div>
                            <input
                                type="radio"
                                checked={selectedLevel === 2}
                                onChange={() => updateLevel(2)}
                                className="text-blue-500 size-5 radio-primary outline-blue-400"
                                name="level"
                            />
                        </div>
                        <div className="flex shadow-sm items-center bg-white space-x-3 py-2 px-3 text-sm font-bold rounded-md">
                            <div>level 3</div>
                            <input
                                type="radio"
                                checked={selectedLevel === 3}
                                onChange={() => updateLevel(3)}
                                className="text-blue-500 size-5 radio-primary outline-blue-400"
                                name="level"
                            />
                        </div>
                    </div>
                ) : (
                    ""
                )}
                <div
                    ref={dataBox}
                    className="h-[80%] mt-3 overflow-y-auto px-6 pb-[15rem] w-full"
                >
                    {selectedLevel === 1 &&
                        type === "register" &&
                        level1.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={1}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={1}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (searchKey?.length < 3) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={1}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={1}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}
                    {selectedLevel === 2 &&
                        type === "register" &&
                        level2.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={2}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={2}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (searchKey?.length < 3) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={2}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={2}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}
                    {selectedLevel === 3 &&
                        type === "register" &&
                        level3.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={3}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={3}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (searchKey?.length < 3) {
                                if (swipe === 1 && today === item?.JoinedOn) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={3}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.JoinedOn
                                ) {
                                    return (
                                        <div key={idx}>
                                            <RegisterAcordian
                                                level={3}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}

                    {selectedLevel === 1 &&
                        (type === "deposit" || type === "withdrawal") &&
                        level1.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.Type === type &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (
                                searchKey?.length < 3 &&
                                item?.Type === type
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}
                    {selectedLevel === 2 &&
                        (type === "deposit" || type === "withdrawal") &&
                        level2.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.Type === type &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (
                                searchKey?.length < 3 &&
                                item?.Type === type
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}
                    {selectedLevel === 3 &&
                        (type === "deposit" || type === "withdrawal") &&
                        level3.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.Type === type &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey.toLowerCase()
                                )
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            } else if (
                                searchKey?.length < 3 &&
                                item?.Type === type
                            ) {
                                if (swipe === 1 && today === item?.Date) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                } else if (
                                    swipe === 2 &&
                                    today !== item?.Date
                                ) {
                                    return (
                                        <div key={idx}>
                                            <Transaction
                                                type={type}
                                                cardDetails={item}
                                            />
                                        </div>
                                    );
                                }
                            }
                        })}

                    {type === "commission" &&
                        (swipe === 1
                            ? todayCommission
                            : overallCommission
                        )?.map((item, idx) => {
                            if (
                                searchKey?.length >= 3 &&
                                item?.UserName?.toLowerCase()?.startsWith(
                                    searchKey
                                )
                            ) {
                                return (
                                    <CommissionAcordian
                                        key={idx}
                                        idx={idx}
                                        cardDetails={item}
                                    />
                                );
                            } else if (searchKey?.length < 3) {
                                return (
                                    <CommissionAcordian
                                        key={idx}
                                        idx={idx}
                                        cardDetails={item}
                                    />
                                );
                            }
                        })}

                    <p
                        ref={noData}
                        hidden={!(childrens <= 0)}
                        style={{
                            height: "20rem",
                            background: "url(/noData.svg) center no-repeat",
                        }}
                    ></p>
                </div>
            </div>
        </div>
    );
}

export default CommissionPopModel;

function CommissionAcordian({ cardDetails }) {
    const [isActive, updateActive] = useState(false);
    const [createdAt, updateCreatedAt] = useState(null);
    useEffect(() => {
        updateCreatedAt(new Date(cardDetails?.createdAt) || new Date());
    }, []);
    return (
        <div
            style={{ boxShadow: "0 5px 5px rgba(0,0,0,0.02) " }}
            className="bg-white mb-4 w-full py-2.5  rounded-md"
        >
            <div className="grid grid-cols-3 px-4 justify-between ">
                <h2 className="font-bold capitalize truncate text-sm">
                    {cardDetails?.From || "no name"}
                </h2>
                <div className="space-y-0.5 flex col-span-1 justify-center ">
                    <div className="flex text-xs text-gray-600 font-bold items-center">
                        <h2>
                            {createdAt &&
                                `${createdAt.getDate()}/${
                                    createdAt?.getMonth() + 1
                                }/${createdAt?.getFullYear()}`}
                        </h2>
                        <h2>-</h2>
                        <h2>
                            {createdAt &&
                                `${createdAt
                                    ?.getHours()
                                    ?.toString()
                                    ?.padStart(2, "0")} : ${createdAt
                                    ?.getMinutes()
                                    ?.toString()
                                    .padStart(2, "0")}`}
                        </h2>
                    </div>
                </div>
                <div className="flex justify-self-end items-center space-x-4">
                    <div>
                        <h2
                            style={{
                                color:
                                    cardDetails?.Commission < 0
                                        ? "red"
                                        : "black",
                            }}
                            className="text-sm font-bold"
                        >
                            {cardDetails?.Commission / 100 || 0}
                        </h2>
                    </div>
                    <div
                        onClick={() => updateActive((prev) => !prev)}
                        className=" flex justify-end h-fit  items-center"
                    >
                        <span className="p-[0.1rem] flex justify-center items-center bg-gray-200 text-gray-600 rounded-full">
                            {isActive ? (
                                <IoIosArrowUp className="text-sm" />
                            ) : (
                                <IoIosArrowDown className="text-sm" />
                            )}
                        </span>
                    </div>
                </div>
            </div>
            {isActive && (
                <>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-0 capitalize text-[0.56rem] py-4 space-y-[1.25px] text-black font-medium"
                    >
                        <MatchCard
                            matchDetails={cardDetails?.details[0]}
                            status={
                                cardDetails?.Commission < 0 ? "lose" : "win"
                            }
                        />
                    </motion.div>
                    <div className="flex justify-center">
                        <h2 className="h-[3px] bg-blue-600 rounded-full w-[25%]"></h2>
                    </div>
                </>
            )}
        </div>
    );
}

// new register accordian button
function RegisterAcordian({ cardDetails, level, idx }) {
    const [isActive, updateActive] = useState(false);
    const [createdAt, updateCreatedAt] = useState(new Date());
    useEffect(() => {
        updateCreatedAt(new Date(cardDetails?.createdAt));
    }, []);
    return (
        <div
            style={{ boxShadow: "0 5px 5px rgba(0,0,0,0.02) " }}
            className="bg-white mb-4 w-full px-6 py-2  rounded-md"
        >
            <div className="grid grid-cols-3 justify-between ">
                <motion.div
                    // layoutId={idx + 1}
                    className="space-y-0.5 flex col-span-2 justify-between "
                >
                    {!isActive && (
                        <>
                            <h2 className="font-bold capitalize truncate text-sm">
                                {cardDetails?.UserName || "no name"}
                            </h2>
                            <div className="flex text-xs text-gray-600 font-bold items-center">
                                <h2>
                                    {createdAt?.getDate()}/
                                    {createdAt?.getMonth() + 1}/
                                    {createdAt?.getFullYear()}
                                </h2>
                                <h2>-</h2>
                                <h2>
                                    {createdAt
                                        ?.getHours()
                                        ?.toString()
                                        ?.padStart(2, "0") +
                                        " : " +
                                        createdAt
                                            ?.getMinutes()
                                            ?.toString()
                                            ?.padStart(2, "0")}
                                </h2>
                            </div>
                        </>
                    )}
                </motion.div>
                <div className="flex justify-self-end space-x-4">
                    <div
                        onClick={() => updateActive((prev) => !prev)}
                        className=" flex justify-end h-fit"
                    >
                        <span className="p-[0.1rem] bg-gray-300 text-gray-600 rounded-full">
                            {isActive ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </span>
                    </div>
                </div>
            </div>
            {isActive && (
                <motion.div
                    initial={{ y: "-20%", opacity: 0 }}
                    animate={{ y: "0", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-0 capitalize text-[0.56rem] space-y-[1.25px] text-black font-medium"
                >
                    <div className="pb-2">
                        <h2 className="font-bold text-[0.7rem] capitalize">
                            user profile
                        </h2>
                    </div>
                    <div className=" space-y-1">
                        <span className="space-x-1 flex">
                            <h2 className="text-semibold">status -</h2>
                            <h2
                                style={{
                                    color:
                                        cardDetails?.Deposited > 0
                                            ? "lime"
                                            : "red",
                                }}
                                className=" font-semibold"
                            >
                                {cardDetails?.Deposited > 0
                                    ? "Active"
                                    : "Deactive"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>username -</h2>
                            <h2 className=" font-semibold">
                                {cardDetails?.UserName || "not available"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>Phone number -</h2>
                            <h2 className=" font-semibold">
                                {cardDetails?.PhoneNumber || "not available"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>parent username -</h2>
                            <h2 className=" font-semibold">
                                {cardDetails?.Parent || "not available"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>current balance -</h2>
                            <h2 className=" font-semibold">
                                {cardDetails?.Balance / 100 || "0"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>total deposit -</h2>
                            <h2 className=" font-semibold">
                                {Number(cardDetails?.Deposited) / 100 || "0"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>joining level -</h2>
                            <h2 className=" font-semibold">{level || 0}</h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>total withdrawal -</h2>
                            <h2 className=" font-semibold">
                                {Number(cardDetails?.Withdrawal) / 100 ||
                                    "not available"}
                            </h2>
                        </span>
                        <span className="space-x-1 flex">
                            <h2>date/time -</h2>
                            <h2 className=" font-semibold">
                                {createdAt?.getDate()}/
                                {createdAt?.getMonth() + 1}/
                                {createdAt?.getFullYear()} -{" "}
                                {createdAt
                                    ?.getHours()
                                    ?.toString()
                                    ?.padStart(2, "0") +
                                    " : " +
                                    createdAt
                                        ?.getMinutes()
                                        ?.toString()
                                        ?.padStart(2, "0")}
                            </h2>
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// this component can be used for new deposit and new withdrawal also
function Transaction({ type, cardDetails }) {
    const [createdAt, updateCratedAt] = useState(new Date());

    useEffect(() => {
        const time = new Date(
            new Date(cardDetails?.createdAt).toLocaleString("en-US", {
                timeZone: "asia/calcutta",
            })
        );
        updateCratedAt(time);
    }, []);

    return (
        <div className="grid text-sm mb-4 grid-cols-3 bg-white text-gray-700 shadow-sm font-bold items-center capitalize px-3 py-2.5 rounded-md">
            <h2 className="col-span-1">{cardDetails?.UserName || "no name"}</h2>
            <h2 className="col-span-1">
                {createdAt &&
                    `${createdAt?.getDate()}/${
                        createdAt?.getMonth() + 1
                    }/${createdAt?.getFullYear()} - ${createdAt
                        ?.getHours()
                        ?.toString()
                        ?.padStart(2, "0")} : ${createdAt
                        ?.getMinutes()
                        ?.toString()
                        ?.padStart(2, "0")}`}
            </h2>
            <h2 className="col-span-1 text-center">
                {cardDetails?.Amount / 100 || 0}
            </h2>
        </div>
    );
}

function MatchCard({ status, matchDetails }) {
    const [Team_a_logo, updateSrcTeam_a] = useState(matchDetails?.Team_a_logo);
    const [Team_b_logo, updateSrcTeam_b] = useState(matchDetails?.Team_b_logo);
    const [MatchStartTime, updateTime] = useState(new Date());

    useEffect(() => {
        const MatchTime = new Date(
            new Date(matchDetails?.StartsAt).toLocaleString("en-US", {
                timeZone: "asia/calcutta",
            })
        );
        updateTime(MatchTime);
    }, []);

    return (
        <div
            style={{ background: status === "win" ? "#ddffeb" : "#FFECEC" }}
            className=" pb-3 w-full rounded-3xl ring-1 ring-[#cccccc]"
        >
            <div className="flex justify-center h-[10%]}">
                <div>
                    <h2
                        style={{
                            background:
                                status === "win" ? "#00ff5e" : "#ff1f00",
                        }}
                        className="capitalize text-sm rounded-b-md px-7 text-white  py-1.5 "
                    >
                        {status}
                    </h2>
                </div>
            </div>
            <div className="text-center capitalize font-bold text-[0.65rem] mt-2">
                <h2>{matchDetails?.LeagueName || "no league available"}</h2>
            </div>
            <div className="w-full flex px-2">
                <div className="flex-[2] text-center flex-col flex w-full items-center h-full ">
                    <span className="h-[60px] flex justify-center items-center w-[60px] rounded-full relative ">
                        <Image
                            src={Team_a_logo || "/search.png"}
                            onError={(e) => updateSrcTeam_a(null)}
                            height={38}
                            width={38}
                            unoptimized
                            alt="team a  logo"
                        />
                    </span>
                    <span className="line-clamp-2 w-[80%] text-xs capitalize font-bold">
                        {matchDetails?.Team_a || "team a unavailable"}
                    </span>
                </div>
                <div className="flex-[1] flex items-center justify-center flex-col">
                    <span className="text-[0.8rem] block font-bold text-red-600">
                        {`${MatchStartTime.getHours()
                            ?.toString()
                            ?.padStart(2, "0")}`}
                        :
                        {`${MatchStartTime.getMinutes()
                            ?.toString()
                            ?.padStart(2, "0")}`}
                    </span>
                    <span className="uppercase text-sm font-bold">
                        {MatchStartTime.getDate()}
                        {MatchStartTime.toDateString().slice(3, 8)}
                    </span>
                </div>
                <div className="flex-[2] flex-col flex text-center w-full items-center h-full ">
                    <span className="h-[60px] flex justify-center items-center w-[60px] rounded-full relative ">
                        <Image
                            src={Team_b_logo || "/search.png"}
                            onError={(e) => updateSrcTeam_b(null)}
                            height={38}
                            width={38}
                            unoptimized
                            alt="team b  logo"
                        />
                    </span>
                    <span className="line-clamp-2 w-[80%] text-xs capitalize font-bold">
                        {matchDetails?.Team_b || "Team b unavailable"}
                    </span>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <h2 className="h-[2px] bg-slate-400 w-[85%]"></h2>
            </div>
            <div className="mt-2 flex px-7 space-x-2 justify-between">
                <div className="w-[50%]">
                    <div className="text-[0.53rem] text-gray-600 space-x-2 capitalize">
                        <span>Bet Ammount</span>
                        <span>
                            {Number(matchDetails?.BetAmount) / 100 || 0}
                        </span>
                    </div>
                    <div className="text-[0.6rem] font-semibold space-x-1">
                        <span>Score</span>
                        <span
                            style={{
                                color:
                                    matchDetails?.Remark === "win"
                                        ? "green"
                                        : "red",
                            }}
                        >
                            {matchDetails?.Score_a || 0}-
                            {matchDetails?.Score_b || 0}
                        </span>
                    </div>
                </div>
                <div className="w-[45%]">
                    <div className="text-[0.53rem] text-gray-600 space-x-2 capitalize">
                        <span>Estimated Income</span>
                        <span
                            style={{
                                color:
                                    matchDetails?.Remark === "win"
                                        ? "green"
                                        : "red",
                            }}
                        >
                            {matchDetails?.Remark === "win" ? "+" : "-"}
                            {(
                                (Number(matchDetails?.BetAmount) / 10000) *
                                    Number(matchDetails?.Percentage) -
                                (Number(matchDetails?.BetAmount) / 10000) *
                                    Number(matchDetails?.Percentage) *
                                    0.05
                            ).toFixed(2) || 0}
                        </span>
                    </div>
                    <div className="text-[0.6rem] font-semibold space-x-1">
                        <span>Odds</span>
                        <span className="text-green-500">
                            {matchDetails?.Percentage || 0}%
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-2 text-center ">
                <div className="space-x-2 flex text-2xl font-extrabold text-gray-500 justify-center items-center">
                    <span>FT</span>
                    <div className="flex space-x-1">
                        <span className=" h-[35px] w-[35px] flex justify-center items-center aspect-square rounded-full bg-white">
                            {matchDetails?.Result_a || 0}
                        </span>
                        <span className=" h-[35px] w-[35px] flex justify-center items-center aspect-square rounded-full bg-white">
                            {matchDetails?.Result_b || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
