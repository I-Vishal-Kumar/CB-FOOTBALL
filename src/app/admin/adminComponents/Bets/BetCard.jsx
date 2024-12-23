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
                        type="number"
                        value={StakeId}
                        className="text-center"
                        onChange={(e) => updateStakeId(StakeId)}
                        name="StakeId"
                    />
                </div>
                <div
                    style={{
                        border: !isDocEditable ? "1px dashed blue" : "none",
                    }}
                    className="truncate size-full flex items-center "
                >
                    {/* <h1>293874829307</h1> */}
                    <input
                        type="number"
                        value={Score_a_own}
                        className="text-center"
                        onChange={(e) =>
                            !isDocEditable
                                ? updateScoreAOwn(e.target.value)
                                : null
                        }
                        name="score_a_own"
                    />
                </div>
                <div
                    style={{
                        border: !isDocEditable ? "1px dashed blue" : "none",
                    }}
                    className="truncate size-full flex items-center text-center"
                >
                    <input
                        type="number"
                        className="text-center"
                        onChange={(e) =>
                            !isDocEditable
                                ? updateScoreBOwn(e.target.value)
                                : null
                        }
                        value={Score_b_own}
                        name="score_b_own"
                    />
                </div>
                <div
                    style={{
                        border: !isDocEditable ? "1px dashed blue" : "none",
                    }}
                    className="truncate size-full flex items-center "
                >
                    <input
                        type="number"
                        onChange={(e) =>
                            !isDocEditable
                                ? updateScoreAResult(e.target.value)
                                : null
                        }
                        className="text-center"
                        value={Score_a_result}
                        name="score_a_result"
                    />
                </div>
                <div
                    style={{
                        border: !isDocEditable ? "1px dashed blue" : "none",
                    }}
                    className="truncate size-full flex items-center "
                >
                    <input
                        type="number"
                        onChange={(e) =>
                            !isDocEditable
                                ? updateScoreBResult(e.target.value)
                                : null
                        }
                        className="text-center"
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
            <div className="text-sm font-semibold flex text-purple-600 space-x-2 px-2">
                {createdAt &&
                    `${createdAt.getDate()}/${createdAt?.getMonth() + 1} /
            ${createdAt?.getFullYear()}-
            ${
                createdAt?.getHours() > 12
                    ? createdAt?.getHours() - 12
                    : createdAt.getHours()
            }
            :${createdAt?.getMinutes()}:${createdAt?.getSeconds()}`}
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
