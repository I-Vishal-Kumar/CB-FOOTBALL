import { connect } from "@/app/modals/dbConfig";
import { ADMIN, BET, USER } from "@/app/modals/modal";
import BetCard from "../adminComponents/Bets/BetCard";
import BlockUnblockCard, {
    BlockNew,
} from "../adminComponents/Bets/BlockUnblockCard";
import QrUpdate from "../adminComponents/Qrcode/QrUpdate";
import { BankEdit } from "../adminComponents/BankDetails/BankEdit";
import UpiEdit from "../adminComponents/UpiDetails/UpiEdit";
import BonusProvider from "../adminComponents/Bonus/BonusProvider";

const Page = async () => {
    let data = [];
    data = await getAllBets();
    let blockedUsers = [];
    blockedUsers = (await getBlockedUsers()) || [];

    let adminData = [];
    adminData = (await getAdminDetails()) || [];

    return (
        <div className="bg-orange-100 pb-8 min-h-screen ">
            <div className="text-center capitalize py-4">
                <h1>bet settlement</h1>
            </div>
            <div className="rounded-xl py-1 mx-auto w-[95%] mt-6 bg-[#ffff]">
                <div className="py-2 px-3">
                    <h1 className="font-bold text-sm">Pending matches</h1>
                </div>
                <div
                    className=" bg-gray-200 px-2 items-center divide-x-[1.2px]  divide-secondary-400 gap-x-2 sm:text-[0.66rem] text-[0.5rem]
        font-bold grid-cols-10 w-full py-2 grid"
                >
                    <div className="col-span-1.5 ">
                        <h1>League Id</h1>
                    </div>
                    <div>
                        <h1>First own score</h1>
                    </div>
                    <div>
                        <h1>Second own score</h1>
                    </div>
                    <div>
                        <h1>First result score</h1>
                    </div>
                    <div className="col-span-1">
                        <h1>Second result score</h1>
                    </div>
                    <div>
                        <h1>Status</h1>
                    </div>
                    <div>
                        <h1>T.T. Users</h1>
                    </div>
                    <div>
                        <h1>Edit</h1>
                    </div>
                    <div>
                        <h1>choose</h1>
                    </div>
                    <div>
                        <h1>submit</h1>
                    </div>
                </div>
                <div className="divide-y-2 divide-gray-300">
                    {data?.map((ele, idx) => (
                        <BetCard
                            key={idx}
                            data={JSON.parse(JSON.stringify(ele))}
                        />
                    ))}
                </div>
            </div>

            <div className="rounded-xl py-1 mx-auto w-[95%] mt-6 flex justify-between space-x-4 ">
                <div className="bg-white rounded-xl w-[50%] ">
                    <div className="text-sm font-bold capitalize px-2  py-2">
                        <h1>Account block</h1>
                    </div>
                    <div>
                        <BlockNew />
                    </div>
                    <div
                        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
                        className="grid capitalize text-[0.65rem] px-2 py-1.5 text-center bg-gray-300"
                    >
                        <div className="text-start">username</div>
                        <div>status</div>
                        <div>block</div>
                        <div>unblock</div>
                    </div>
                    <div className="space-y-1.5 divide-y-2">
                        {(blockedUsers || []).map((ele, idx) => (
                            <BlockUnblockCard
                                key={ele?._id}
                                UserName={ele?.UserName}
                            />
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl w-[50%]">
                    <div className="text-sm font-bold capitalize px-2  py-2">
                        <h1>Upload qr code</h1>
                    </div>
                    <QrUpdate />
                </div>
            </div>
            {/* bank details and upi edit section */}
            <div className="rounded-xl py-1 mx-auto w-[95%] mt-6 flex justify-between space-x-4 ">
                <div className="bg-white rounded-xl w-[50%] ">
                    <div className="text-sm font-bold capitalize px-2  py-2">
                        <h1>update bank details</h1>
                    </div>
                    <div
                        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
                        className="grid capitalize text-[0.65rem] px-2 py-1.5  bg-gray-300"
                    >
                        <div className="text-start">bank name</div>
                        <div>account number</div>
                        <div>holder name</div>
                        <div>IFSC</div>
                    </div>
                    <div className="space-y-1.5 divide-y-2">
                        <BankEdit data={adminData?.BankDetails || {}} />
                    </div>
                </div>
                <div className="bg-white rounded-xl w-[50%]">
                    <div className="text-sm font-bold capitalize px-2  py-2">
                        <h1>Upload upi id's</h1>
                    </div>
                    <UpiEdit data={adminData?.UpiIds || []} />
                </div>
            </div>

            {/* bonus section */}
            <div className="rounded-xl py-1 mx-auto w-[95%] mt-6 flex justify-center space-x-4 ">
                <div className="bg-white rounded-xl w-[50%] ">
                    <div className="text-sm font-bold capitalize px-2  py-2">
                        <h1>extra bonus</h1>
                    </div>
                    <div className="px-2">
                        <BonusProvider />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;

async function getAllBets() {
    "use server";
    try {
        await connect();
        let data = await BET.aggregate([
            {
                $match: { Status: 1 },
                $match: { StakeId: 1349273 },
            },
            {
                $group: {
                    _id: "$StakeId",
                    bet: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$bet" },
            },
        ]);
        for (let bet of data) {
            let count = await BET.countDocuments({
                StakeId: bet?.StakeId,
                Status: 0,
            })

            data[data.indexOf(bet)]["Count"] = count;
        }
        data.reverse();
        return data;
    } catch (error) {
        console.log(error);
    }
}
async function getBlockedUsers() {
    "use server";
    try {
        await connect();
        let data = USER.find({ Blocked: true }, { UserName: 1 });
        return data;
    } catch (error) {
        console.log(error);
    }
}

async function getAdminDetails() {
    "use server";
    try {
        await connect();
        let data = ADMIN.findOne({ _id: "673822ba4b425f2f3f2cef22" });
        return data || [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const dynamic = "force-dynamic";
