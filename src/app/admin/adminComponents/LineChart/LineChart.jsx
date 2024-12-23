"use client";
import React, { useEffect, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-adapter-date-fns";

export const LineChart = () => {
    const [deposits, updateDepositsData] = useState([]);
    const [withdrawals, updateWithdrawalsData] = useState([]);
    const [totalDeposits, updateTotalDeposits] = useState(0);
    const [totalWithdrawals, updateTotalWithdrawals] = useState(0);
    const [isLoaded, updateLoaded] = useState(false);

    function compareDates(a, b) {
        const dateA = new Date(a._id.split("/").reverse().join("-"));
        const dateB = new Date(b._id.split("/").reverse().join("-"));
        return dateA - dateB;
    }

    async function gatherData(deposit, withdrawal) {
        let totalDeposits = (deposit || []).reduce(
            (acc, currVal) => acc + currVal?.total / 100,
            0
        );
        let totalWithdrawals = (withdrawal || []).reduce(
            (acc, currVal) => acc + currVal?.total / 100,
            0
        );
        let deposit_data = deposit.sort(compareDates);
        let withdraw_data = withdrawal.sort(compareDates);
        updateDepositsData([...deposit_data]);
        updateWithdrawalsData([...withdraw_data]);
        updateTotalDeposits(totalDeposits);
        updateTotalWithdrawals(totalWithdrawals);
    }
    async function updateData() {
        try {
            let data = await fetch("/api/admin/stats");
            data = await data.json();
            if (data?.status === 200) {
                let deposit_data = data?.data?.deposits || [];
                let withdraw_data = data?.data?.withdrawals || [];
                gatherData(deposit_data, withdraw_data);
            } else {
                alert(JSON.stringify(data?.message));
            }
        } catch (error) {
            alert(JSON.stringify(error));
        }
    }
    useEffect(() => {
        async function getData() {
            await updateData();
        }
        if (!isLoaded) {
            getData();
            updateLoaded(true);
        }
        let revalidateData = setInterval(() => updateData(), 60 * 1000);
        return () => clearInterval(revalidateData);
    }, [deposits, withdrawals, gatherData]);

    return (
        <div className="flex space-x-3 h-[90%] justify-evenly py-3 px-4">
            <div className="w-[40%]  relative rounded-xl shadow-md bg-[#3c364d] text-center h-full">
                <h1 className="py-3 h-[10%] text-[#F4EEE0] font-bold">
                    Deposit
                </h1>
                <Chart dataSet={deposits || []} type={"deposit"} />
            </div>
            <div className="w-[20%] h-full flex flex-col space-y-4 justify-center">
                <div className="bg-[#433c56] text-slate-50 rounded-md text-center shadow-md py-2 space-y-3 px-1">
                    <h1 className="text-[0.9rem]">Finance Status</h1>
                    <div
                        style={{
                            background:
                                totalDeposits - totalWithdrawals < 0
                                    ? "#f04650"
                                    : totalDeposits - totalWithdrawals > 600000
                                    ? "#4adb7f"
                                    : "#9ff046",
                        }}
                        className="rounded-md text-lg bg-green-400 py-4 text-center font-bold text-white"
                    >
                        <p>
                            {totalDeposits - totalWithdrawals < 0
                                ? "BAD"
                                : totalDeposits - totalWithdrawals > 600000
                                ? "EXCELENT"
                                : "GOOD"}
                        </p>
                    </div>
                </div>
                <div className="bg-[#433c56] text-slate-50 rounded-md text-center shadow-md py-2 space-y-3 px-1">
                    <h1 className="text-[0.9rem]">Total deposit/withdrawal</h1>
                    <div className="rounded-md flex px-2 flex-col text-start space-x-2 py-3 font-bold text-md bg-red-400 text-white">
                        <div>Deposit {totalDeposits}</div>
                        <div className="m-0">Withdrawal {totalWithdrawals}</div>
                    </div>
                </div>
            </div>
            <div className="w-[40%] rounded-xl text-center shadow-md bg-[#3c364d] h-full">
                <h1 className="py-3 h-[10%] text-[#F4EEE0] font-bold">
                    Withdrawal
                </h1>
                <Chart
                    type={"withdrawal"}
                    dataSet={withdrawals.reverse() || []}
                />
            </div>
        </div>
    );
};

const Chart = ({ type, dataSet }) => {
    const [conf, updateConf] = useState({
        labels: [],
        datasets: [
            {
                label: "success",
                data: [],
                fill: false,
                borderColor: "#00FFF5",
                tension: 0.1,
            },
        ],
    });
    useEffect(() => {
        if (dataSet?.length > 0) {
            let newConf = {
                labels: dataSet?.map(
                    (ele) => new Date(ele?._id?.split("/").reverse().join("/"))
                ),
                datasets: [
                    {
                        label: "success",
                        data: (dataSet || [])?.map((ele) => ele?.total / 100),
                        fill: false,
                        borderColor: type === "deposit" ? "lime" : "#00FFF5",
                        tension: 0.1,
                    },
                ],
            };
            updateConf(newConf);
        }
    }, [dataSet]);
    return (
        <div className="mt-4 h-[90%] flex px-2 items-center">
            {dataSet?.length > 0 && (
                <Line
                    data={conf}
                    options={{
                        plugins: {
                            legend: {
                                labels: {
                                    // Change the color of the text
                                    color: "white",
                                },
                            },
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: "#F4EEE0",
                                },
                                grid: {
                                    color: "#6D5D6E",
                                },
                                type: "time",
                                time: {
                                    unit: "week",
                                    // unit: "day",
                                },
                            },
                            y: {
                                ticks: { color: "#F4EEE0", maxTicksLimit: 10 },
                                grid: { color: "#6D5D6E" },
                            },
                        },
                    }}
                />
            )}
        </div>
    );
};

export const dynamic = "force-dynamic";
