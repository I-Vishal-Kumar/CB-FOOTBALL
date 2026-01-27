import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION } from "@/app/modals/modal";
import DepositCard from "../adminComponents/Deposit/DepositCard";
import { FaSearch } from "react-icons/fa";
import Search from "../adminComponents/Search/Search";

const Page = async ({ searchParams }) => {
    let data = [];
    data = await getAllTransactions();

    return (
        <div className="bg-green-100 pb-8  ">
            <div className="text-center py-4">
                <h1>Deposit</h1>
            </div>
            <Search from={"deposit"} />
            <div className="rounded-xl py-1 mx-auto w-[95%] mt-6 bg-[#ffff]">
                <div className="py-2 px-3">
                    <h1 className="font-bold text-sm">
                        UPI/USDT Upcomming request
                    </h1>
                </div>
                {/* boxes */}
                <div className="space-y-3 px-1.5">
                    {(data || []).map((ele, idx) => {
                        if (
                            searchParams?.search &&
                            ele?.TransactionId?.toString()?.startsWith(
                                searchParams?.search
                            )
                        ) {
                            return (
                                <DepositCard
                                    idx={idx}
                                    key={idx}
                                    data={JSON.parse(JSON.stringify(ele))}
                                />
                            );
                        } else if (!searchParams?.search) {
                            return (
                                <DepositCard
                                    idx={idx}
                                    key={idx}
                                    data={JSON.parse(JSON.stringify(ele))}
                                />
                            );
                        }
                    })}
                </div>
            </div>
        </div>
    );
};

export default Page;

async function getAllTransactions() {
    "use server";
    try {
        await connect();

        // Get the current date
        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
            })
        );
        
        // Calculate start of 3 days ago (day before yesterday at 00:00:00)
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
        threeDaysAgo.setHours(0, 0, 0, 0);
        
        // Calculate end of today (23:59:59)
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        // Fetch transactions for the last three days using createdAt
        const data = await TRANSACTION.find({
            Type: "deposit",
            createdAt: {
                $gte: threeDaysAgo,
                $lte: endOfToday
            }
        }).sort({ createdAt: -1 });

        return data;
    } catch (error) {
        console.log(error);
    }
}

export const dynamic = "force-dynamic";
