import React, { useEffect, useState } from "react";

import Image from "next/image";

function StakeHistory({ bgColor, result, resultbg, data }) {
    const [MatchStartTime, updateTime] = useState(new Date());
    const [Team_a_logo, updateSrcTeam_a] = useState();
    const [Team_b_logo, updateSrcTeam_b] = useState();

    useEffect(() => {
        const MatchTime = new Date(data?.StartsAt);
        updateTime(MatchTime);
        console.log(bgColor, resultbg);
        updateSrcTeam_a(data?.Team_a_logo);
        updateSrcTeam_b(data?.Team_b_logo);
    }, []);

    return (
        <div
            style={{ background: bgColor }}
            className="border-2 border-gray-[#e2dbd3] min-h-min mb-2  w-[90%] mr-auto ml-auto rounded-[15px] mt-[.5rem] bg-[#fbf3eb] shadow-sm pb-2 text-[.6rem] "
        >
            <div
                style={{ background: resultbg }}
                className="w-max mr-auto capitalize ml-auto px-[1rem] py-[.1rem] rounded-b-lg font-semibold  text-white "
            >
                {result}
            </div>
            <div className="text-center text-[.65rem] font-bold my-[.5rem] ">
                {data?.LeagueName || "no league available"}
            </div>

            <div className=" flex justify-between place-items-center w-[95%] mr-auto ml-auto ">
                <div className="w-[35%]  flex flex-col place-items-center   ">
                    <div className=" h-[40px] w-[40px] rounded-[100%] ">
                        <Image
                            src={Team_a_logo}
                            alt="teamlogo"
                            width={150}
                            height={150}
                        />
                    </div>
                    <p className=" text-xs leading-3  line-clamp-2 flex-[2]  font-bold capitalize w-[95%] text-center overflow-ellipsis break-words ">
                        {data?.Team_a || "no team available"}
                    </p>
                </div>

                <div className="flex  flex-col place-items-center  ">
                    <p className="text-red-600 font-[700] text-[.8rem] ">
                        {" "}
                        {MatchStartTime.getHours()}:
                        {MatchStartTime.getMinutes()}
                    </p>
                    <p className="font-[600] text-[.7rem] ">
                        {" "}
                        {(MatchStartTime.getDate() < 10
                            ? "0" + MatchStartTime.getDate()
                            : MatchStartTime.getDate()) +
                            MatchStartTime?.toString().slice(3, 7)}
                    </p>
                </div>

                <div className="w-[35%]  flex flex-col place-items-center   ">
                    <div className=" h-[40px] w-[40px] rounded-[100%] ">
                        <Image
                            src={Team_b_logo}
                            alt="teamlogo"
                            width={150}
                            height={150}
                            className="object-contain "
                        />
                    </div>
                    <p className=" text-xs leading-3  line-clamp-2 flex-[2]  font-bold capitalize w-[95%] text-center overflow-ellipsis break-words ">
                        {data?.Team_b || "no team available"}
                    </p>
                </div>
            </div>

            <hr className=" w-[88%] mr-auto ml-auto mt-[.7rem] bg-black  " />

            <div className=" mt-[.3rem] w-[87%] mr-auto ml-auto ">
                <div
                    className="flex  justify-between text-xs line-clamp-1 font-[600] "
                    style={{ color: "gray" }}
                >
                    <p className="">Stake ID : {data?.StakeId}</p>
                    <span className="w-[50%] line-clamp-1 text-ellipsis  flex  ">
                        Stake Time{" "}
                        {(MatchStartTime.getDate() < 10
                            ? "0" + MatchStartTime.getDate()
                            : MatchStartTime.getDate()) +
                            MatchStartTime?.toString().slice(3, 7)}
                        <p className="ml-2">
                            {MatchStartTime.getHours()}:
                            {MatchStartTime.getMinutes()}
                        </p>
                    </span>
                </div>

                <div
                    className="flex  justify-between text-xs line-clamp-1 font-[600] "
                    style={{ color: "gray" }}
                >
                    <p className="line-clamp-1 text-ellipsis">
                        Stake Amount {Number(data?.BetAmount) / 100 || 0}
                    </p>
                    <span className="w-[50%]  text-nowrap flex line-clamp-1 text-ellipsis ">
                        Estimated Income
                        <p
                            className="text-nowrap ml-[.4rem] "
                            style={{ color: "#00db58" }}
                        >
                            {(
                                ((Number(data?.BetAmount) / 100) *
                                    data?.Percentage) /
                                    100 -
                                ((((Number(data?.BetAmount) / 100) *
                                    data?.Percentage) /
                                    100) *
                                    5) /
                                    100
                            ).toFixed(2) || 0}
                        </p>{" "}
                    </span>
                </div>

                <div className="flex  justify-between text-xs line-clamp-1  font-extrabold leading-4 ">
                    <span className="flex place-items-center  ">
                        Score FT{" "}
                        <p className="text-red-600 text-[.8rem] font-extrabold ">
                            {data?.Score_a}-{data?.Score_b}
                        </p>{" "}
                    </span>
                    <span className="w-[50%] flex place-items-center ">
                        Odds{" "}
                        <p
                            className=" ml-[.3rem] "
                            style={{ color: "#00db58" }}
                        >
                            {" "}
                            {data?.Percentage}%
                        </p>{" "}
                    </span>
                </div>
            </div>

            <div className=" flex justify-center mt-[.5rem] ">
                <div className=" h-[35px] w-[35px] flex place-items-center justify-center  m-[.2rem] font-extrabold text-[.9rem] text-[#757f79] ">
                    FT
                </div>
                <div className=" h-[35px] w-[35px] flex place-items-center justify-center  m-[.2rem] rounded-[100px] font-extrabold text-[.9rem] text-red bg-white ">
                    {data?.Result_a}
                </div>
                <div className=" h-[35px] w-[35px] flex place-items-center justify-center  m-[.2rem] rounded-[100px] font-extrabold text-[.9rem] text-[#a0a3a1] bg-[#f9fffb] ">
                    {data?.Result_b}
                </div>
            </div>
        </div>
    );
}

export default StakeHistory;

// 11088
