"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { FaEdit } from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { settle } from "./Action";

const initialState = {
    message: "",
    received: false,
};

const BetCard = ({ data }) => {
    const [isDocEditable, toggleEditable] = useState(true);
    const [Status, updateStatus] = useState(0);
    const [createdAt, updateCreatedAt] = useState(null);
    const [Score_a_own, updateScoreAOwn] = useState(0);
    const [StakeId, updateStakeId] = useState("");
    const [Score_b_own, updateScoreBOwn] = useState(0);
    const [Score_a_result, updateScoreAResult] = useState(0);
    const [Score_b_result, updateScoreBResult] = useState(0);
    const [state, formAction] = useFormState(settle, initialState);

    useEffect(() => {
        if (data) {
            updateStatus(data?.Status);
            updateCreatedAt(new Date(data?.StartsAt));
            updateStakeId(data?.StakeId);
        }
    }, [data]);

    return (
        <form action={formAction}>
            <div className="grid py-2 px-2 items-center grid-cols-10 md:text-[0.66rem]  text-[0.6rem] gap-x-2 bg-white">
                <div>
                    <input
                        type="text"
                        value={StakeId}
                        className="text-center w-full"
                        readOnly
                        name="StakeId"
                    />
                </div>
                <div
                    style={{ border: !isDocEditable ? "1px dashed blue" : "none" }}
                    className="truncate size-full flex items-center"
                >
                    <input
                        type="number"
                        value={Score_a_own}
                        disabled={isDocEditable}
                        className="text-center w-full disabled:opacity-40"
                        onChange={(e) => updateScoreAOwn(e.target.value)}
                        name="score_a_own"
                    />
                </div>
                <div
                    style={{ border: !isDocEditable ? "1px dashed blue" : "none" }}
                    className="truncate size-full flex items-center text-center"
                >
                    <input
                        type="number"
                        disabled={isDocEditable}
                        className="text-center w-full disabled:opacity-40"
                        onChange={(e) => updateScoreBOwn(e.target.value)}
                        value={Score_b_own}
                        name="score_b_own"
                    />
                </div>
                <div
                    style={{ border: !isDocEditable ? "1px dashed blue" : "none" }}
                    className="truncate size-full flex items-center"
                >
                    <input
                        type="number"
                        disabled={isDocEditable}
                        onChange={(e) => updateScoreAResult(e.target.value)}
                        className="text-center w-full disabled:opacity-40"
                        value={Score_a_result}
                        name="score_a_result"
                    />
                </div>
                <div
                    style={{ border: !isDocEditable ? "1px dashed blue" : "none" }}
                    className="truncate size-full flex items-center"
                >
                    <input
                        type="number"
                        disabled={isDocEditable}
                        onChange={(e) => updateScoreBResult(e.target.value)}
                        className="text-center w-full disabled:opacity-40"
                        value={Score_b_result}
                        name="score_b_result"
                    />
                </div>
                <div className="flex justify-start gap-x-2">
                    <div className="space-y-1">
                        <span className="flex justify-center items-center">
                            <MdPending className="h-[12px] w-[12px] text-yellow-500 " />
                        </span>
                        <input
                            type="radio"
                            checked={Status === 0}
                            onChange={(e) => updateStatus(0)}
                            name="stat_0"
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="flex justify-center items-center">
                            <Image
                                src="/tick_mark.png"
                                height={12}
                                width={12}
                                alt="correct"
                            />
                        </span>
                        <input
                            checked={Status === 1}
                            onChange={(e) => updateStatus(1)}
                            type="radio"
                            name="stat_1"
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="flex justify-center items-center">
                            <Image
                                src="/wrong.png"
                                height={12}
                                width={12}
                                alt="correct"
                            />
                        </span>
                        <input
                            type="radio"
                            checked={Status === 2}
                            onChange={(e) => updateStatus(2)}
                            name="stat_2"
                        />
                    </div>
                </div>
                <div className="truncate size-full text-center flex justify-center items-center ">
                    <h1 className="text-center">{data?.Count || ""}</h1>
                </div>
                <div
                    onClick={() => toggleEditable((prev) => !prev)}
                    className="flex  items-center"
                >
                    <FaEdit className="size-4 text-blue-700" />
                </div>
                <div className="flex  items-center">
                    <select
                        name="membership"
                        className="bg-gray-300 px-0.5 py-2 rounded-md capitalize"
                    >
                        <option value={0}>for all</option>
                        <option value={5500000}>ruby</option>
                        <option value={10500000}>saphire</option>
                        <option value={30000000}>diamond</option>
                        <option value={70000000}>blue diamond</option>
                    </select>
                </div>
                <div>
                    <Button />
                </div>
            </div>
            {/* match identity */}
            <div className="flex items-center gap-x-3 px-2 pt-1 text-[0.6rem] font-semibold text-gray-700">
                {data?.LeagueName && (
                    <span className="text-blue-600 truncate max-w-[35%]">{data.LeagueName}</span>
                )}
                {(data?.Team_a || data?.Team_b) && (
                    <span className="truncate">
                        {data?.Team_a || "?"} <span className="text-gray-400">vs</span> {data?.Team_b || "?"}
                    </span>
                )}
                {createdAt && (
                    <span className="ml-auto text-purple-600 whitespace-nowrap">
                        {`${createdAt.getDate()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()} - ${createdAt.getHours().toString().padStart(2, "0")}:${createdAt.getMinutes().toString().padStart(2, "0")}`}
                    </span>
                )}
            </div>
            <Listeners message={state?.message} />
        </form>
    );
};

export default BetCard;

export function Listeners({ message }) {
    let { pending } = useFormStatus();
    return (
        <p
            aria-live="polite"
            className="text-sm p-1 text-red-400 font-semibold"
        >
            {message}
            {pending ? "Loading........" : false}
        </p>
    );
}
export function Button({ isDisabled }) {
    let { pending } = useFormStatus();
    return (
        <button
            disabled={isDisabled || pending}
            aria-disabled={"loading"}
            className="bg-blue-600 disabled:bg-blue-400 rounded-md text-white px-1.5 font-bold capitalize py-0.5"
            type="submit"
        >
            {pending ? "loading.." : "Submit"}
        </button>
    );
}
