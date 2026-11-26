"use client";
import Image from "next/image";
import { FaInfoCircle, FaLock } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useContext, useState, useEffect } from "react";
import Layout from "@/app/components/Layout";
import AddBank from "@/app/components/AddBank";
import { UserContext } from "@/app/helpers/UserContext";
import { useRouter } from "next/navigation";
import { AlertContext } from "@/app/helpers/AlertContext";
import Loading from "@/app/components/Loading";
import Back from "@/app/components/LiveChats/Back";

const USDT_TO_INR = 88;
const HANDLING_FEE_PCT = 12;
const MIN_USDT = 50;
const MAX_USDT = 100000;

function Page() {
    const { userBalance, userOtherData, getBalance } = useContext(UserContext);
    const { getAlert } = useContext(AlertContext);
    const [loading, setLoading] = useState(true);
    const [usdtAmount, setUsdtAmount] = useState("");
    const [withdrawPass, setWithdrawPass] = useState("");
    const [editBank, updateEditBank] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!userBalance && !userOtherData?.UserName) getBalance();
    }, [userBalance, userOtherData]);

    const inrCost = Number(usdtAmount) * USDT_TO_INR;
    const usdtAfterFee = Number(usdtAmount) * (1 - HANDLING_FEE_PCT / 100);

    async function withdraw() {
        const amt = Number(usdtAmount);
        if (!amt || amt < MIN_USDT) {
            getAlert("opps", `Minimum withdrawal is ${MIN_USDT} USDT`);
            return;
        }
        if (amt > MAX_USDT) {
            getAlert("opps", `Maximum withdrawal is ${MAX_USDT.toLocaleString()} USDT`);
            return;
        }
        if (!withdrawPass) {
            getAlert("opps", "Withdrawal password is required");
            return;
        }
        if (inrCost > (userBalance || 0)) {
            getAlert("opps", "Insufficient balance");
            return;
        }
        try {
            getAlert();
            const res = await fetch("/api/payment/withdraw", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    Amount: inrCost,
                    isLocalBank: false,
                    WithdrawCode: withdrawPass,
                }),
            });
            const data = await res.json();
            if (data?.status === 200) {
                getAlert("success", data?.message || "Withdrawal submitted");
                await getBalance();
            } else if (data?.status === 302) {
                getAlert("redirect", data?.message || "Session expired");
            } else {
                getAlert("opps", data?.message || "Something went wrong");
            }
        } catch {
            getAlert("opps", "Something went wrong");
        }
    }

    return (
        <Layout>
            <section className="bg-[#F8FCFF] relative overflow-hidden w-full h-[100dvh]">
                {loading && <Loading />}
                <Back page={"USDT withdrawal"} />

                <main className="space-y-1 h-fit px-4">
                    {/* hero */}
                    <div
                        style={{ background: "url(/profileBg.jpg) center no-repeat", backgroundSize: "cover" }}
                        className="h-[65%] py-4 relative w-full rounded-xl"
                    >
                        <div className="flex flex-col w-full justify-center items-center py-3">
                            <span className="size-16 ring-[3px] relative ring-white overflow-hidden rounded-full">
                                <Image
                                    style={{ height: "100%", width: "100%" }}
                                    src={userOtherData?.Avatar ? `/avatar/${userOtherData?.Avatar}.png` : "/logo.png"}
                                    height={40} width={40} unoptimized alt="avatar"
                                />
                            </span>
                            <h2 className="capitalize text-sm mt-2 truncate font-extrabold text-white">
                                {userOtherData?.UserName || "User Name"}
                            </h2>
                        </div>

                        <div className="w-full mt-1 px-2">
                            <div className="rounded-full py-0.5 flex justify-between">
                                <div className="flex text-white rounded-full flex-row-reverse bg-gray-500/50 px-2 space-x-1 gap-x-2 items-center justify-end">
                                    <span className="aspect-square relative flex justify-center items-center text-gray-600 rounded-full bg-gray-200 p-0.5">
                                        {userOtherData?.UsdtBankAdded ? (
                                            <Image src="/tick_mark.png" height={8} width={8} alt="added" />
                                        ) : (
                                            <Image src="/wrong.png" height={8} width={8} alt="not added" />
                                        )}
                                    </span>
                                    <p className="capitalize font-bold text-[0.65rem]">USDT wallet</p>
                                </div>
                            </div>
                        </div>

                        {/* add / edit bank button */}
                        <div
                            onClick={() => updateEditBank(true)}
                            className="absolute h-[30%] bg-[#333333] rounded-full text-white left-[50%] translate-x-[-50%] top-[100%] translate-y-[-50%] aspect-square flex text-[2rem] justify-center items-center"
                        >
                            <FaPlus />
                        </div>
                    </div>

                    {/* balance */}
                    <div className="pt-1 px-1">
                        <div className="py-2 mt-4 relative flex justify-between flex-row-reverse rounded-full p-1">
                            <div className="flex pl-1 bg-slate-50 ring-1 ring-gray-200 rounded-full p-0.5 justify-center items-center px-1 space-x-1">
                                <span className="h-full aspect-square rounded-full text-white bg-[#333333] flex text-[0.7rem] p-0.5 justify-center items-center">
                                    ₹
                                </span>
                                <span className="text-sm font-bold pr-3">
                                    {new Intl.NumberFormat("en-US", { style: "decimal", maximumFractionDigits: 2 }).format(userBalance || 0)}
                                </span>
                                <span
                                    onClick={() => router.push("/profile/recharge")}
                                    className="h-full aspect-square rounded-full text-white bg-[#333333] flex text-[0.8rem] p-0.5 justify-center items-center"
                                >
                                    <FaPlus />
                                </span>
                            </div>
                            <div className="flex pl-1 justify-center flex-row-reverse items-center space-x-1">
                                <span className="text-[0.8rem] text-gray-800 font-extrabold capitalize pr-3">
                                    transfer to USDT
                                </span>
                            </div>
                        </div>
                    </div>
                </main>

                <div className="h-[60%] pt-2">
                    <div className="h-full overflow-y-scroll pb-40 px-4">

                        {/* withdrawable balance */}
                        <div className="px-1 mb-3">
                            <div className="relative flex justify-between flex-row-reverse rounded-full p-1">
                                <div className="flex bg-slate-50 ring-1 ring-gray-200 rounded-full py-1 text-xs justify-center items-center px-2 space-x-2">
                                    <span className="h-full font-semibold capitalize rounded-full flex justify-center items-center">
                                        withdrawable balance
                                    </span>
                                    <span className="text-xs text-red-500 font-medium">
                                        {(userBalance || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex pl-1 justify-center flex-row-reverse items-center space-x-1">
                                    <span className="text-gray-800 font-bold text-[0.6rem] capitalize pr-3">
                                        USDT transfer
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* form */}
                        <div className="px-2 space-y-3">
                            {/* USDT amount + after fee */}
                            <div>
                                <div className="flex capitalize font-semibold text-[0.6rem] space-x-2 mb-1">
                                    <span className="w-[50%]">USDT amount</span>
                                    <span className="w-[50%] pl-3">after {HANDLING_FEE_PCT}% fee</span>
                                </div>
                                <div className="ring-[1.5px] ring-[#034694] py-2 rounded-md">
                                    <div className="flex capitalize font-semibold text-[0.65rem] space-x-2">
                                        <div className="flex w-[50%] space-x-2 px-2 items-center">
                                            <span className="shrink-0 rounded-full text-white bg-[#1a9c5b] flex text-[0.65rem] px-1.5 py-0.5 font-bold">
                                                USDT
                                            </span>
                                            <input
                                                type="number"
                                                value={usdtAmount}
                                                onChange={(e) => setUsdtAmount(e.target.value)}
                                                placeholder="Enter USDT"
                                                className="w-full h-full bg-transparent outline-none text-gray-600"
                                            />
                                        </div>
                                        <div className="flex w-[50%] space-x-2 px-2 items-center">
                                            <span className="shrink-0 rounded-full text-white bg-[#1a9c5b] flex text-[0.65rem] px-1.5 py-0.5 font-bold">
                                                USDT
                                            </span>
                                            <input
                                                type="number"
                                                disabled
                                                value={usdtAmount ? usdtAfterFee.toFixed(4) : ""}
                                                placeholder="0"
                                                className="w-full h-full outline-none text-green-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* INR cost indicator */}
                            {usdtAmount > 0 && (
                                <p className="text-[0.65rem] text-gray-500 font-medium px-1">
                                    ≈ ₹{inrCost.toLocaleString()} will be deducted from your balance (at ₹{USDT_TO_INR}/$)
                                </p>
                            )}

                            {/* withdrawal password */}
                            <div className="ring-[1.5px] ring-[#034694] py-2 rounded-md">
                                <div className="flex capitalize font-semibold text-[0.65rem] space-x-2">
                                    <div className="flex w-full space-x-2 px-2 items-center">
                                        <span className="h-full aspect-square rounded-full text-white bg-[#333333] flex text-[0.7rem] p-1 justify-center items-center">
                                            <FaLock />
                                        </span>
                                        <input
                                            type="text"
                                            value={withdrawPass}
                                            onChange={(e) => setWithdrawPass(e.target.value)}
                                            placeholder="Enter withdrawal password"
                                            className="w-full h-full bg-transparent outline-none text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* USDT address display */}
                            {userOtherData?.UsdtBank?.UsdtAddress && (
                                <div className="bg-gray-100 rounded-md px-3 py-2 text-[0.65rem] text-gray-600 break-all">
                                    <span className="font-bold capitalize mr-1">USDT address:</span>
                                    {userOtherData.UsdtBank.UsdtAddress}
                                    {userOtherData.UsdtBank.AppName && (
                                        <span className="ml-2 text-gray-400">({userOtherData.UsdtBank.AppName})</span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={withdraw}
                                className="w-full capitalize rounded-md mt-2 shadow-md bg-[#034694] text-white font-bold py-2"
                            >
                                transfer to USDT
                            </button>
                        </div>

                        {/* instructions */}
                        <div className="px-2 py-1 space-y-2 mt-4">
                            <div className="flex pl-4 space-x-1">
                                <FaInfoCircle color="red" />
                                <p className="text-[0.65rem] font-bold">Withdrawal instructions</p>
                            </div>
                            <ol className="pl-8 text-[0.65rem] list-decimal space-y-1">
                                <li>Minimum withdrawal: {MIN_USDT} USDT | Maximum: {MAX_USDT.toLocaleString()} USDT.</li>
                                <li>Handling charge: {HANDLING_FEE_PCT}% of the withdrawal amount.</li>
                                <li>Exchange rate: ₹{USDT_TO_INR} = 1 USDT.</li>
                                <li>Withdrawal timing: Monday to Friday only.</li>
                                <li>Only one withdrawal per day per account is allowed.</li>
                                <li>Please allow 24 to 48 hours for processing.</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {editBank && (
                    <AddBank
                        localEditable={false}
                        usdtEditable={true}
                        closePopup={updateEditBank}
                        isUpdatingBank={false}
                    />
                )}
            </section>
        </Layout>
    );
}

export default Page;
