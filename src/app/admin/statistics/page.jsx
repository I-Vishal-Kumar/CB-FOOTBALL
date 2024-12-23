"use client";
import { LineChart } from "../adminComponents/LineChart/LineChart";

async function Stats() {
    return (
        <div className=" h-screen bg-[#352F44]">
            <div className="text-center uppercase py-2 h-full text-green-400">
                <h1>Statistics</h1>
                <LineChart />
            </div>
        </div>
    );
}

export default Stats;

export const dynamic = "force-dynamic";
