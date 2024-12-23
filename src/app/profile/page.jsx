"use client";
import Image from "next/image";
import { FaRupeeSign } from "react-icons/fa";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { FaPlus } from "react-icons/fa6";
import { IoMdLogOut } from "react-icons/io";
import { useContext, useEffect, useRef, useState } from "react";
import RecordAccordians from "../components/RecordAccordian";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { UserContext } from "../helpers/UserContext";
import Loading from "../components/Loading";
import { AlertContext } from "../helpers/AlertContext";
import { IoGameControllerOutline } from "react-icons/io5";
import Link from "next/link";

function Page() {
    const router = useRouter();
    const { userBalance, userOtherData } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [swipe, setSwipe] = useState(1);
    const [vipInfo, updateVipInfo] = useState({
        Vip: "emerald",
        img: "/emerald.png",
    });
    const [transactionData, updateTransaction] = useState([]);
    const [getRecord, updateRecord] = useState(false);
    const dataBox = useRef();
    const noData = useRef();
    const [childrens, updateChildrens] = useState(2);
    const { getAlert } = useContext(AlertContext);

    async function getTransactionData() {
        try {
            let res = await fetch("/api/profile");
            setLoading(false); // Set loading to false when data is fetched
            if (res?.ok) {
                res = await res.json();
                if (res?.status === 200) {
                    updateTransaction(res?.data);
                } else {
                    getAlert("redirect", "session expired login again");
                    return;
                }
            }
        } catch (error) {
            getAlert("redirect", "session expired login again");
        }
    }
    async function logout() {
        try {
            getAlert();
            let config = {
                method: "POST",
                header: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({}),
            };
            let res = await fetch("/api/user", config);
            res = await res?.json();
            getAlert("redirect", res?.message || "logged out successfull");
        } catch (error) {
            getAlert("redirect", res?.message || "logged out successfull");
        }
    }
    useEffect(() => {
        if (dataBox?.current && noData?.current) {
            let toExclue = noData?.current;
            let childrens = Array.from(dataBox?.current?.children);
            const filteredList = childrens.filter(
                (child) => child !== toExclue
            );
            updateChildrens(filteredList?.length);
        }
    }, [swipe, dataBox?.current, transactionData]);

    useEffect(() => {
        if (userOtherData?.VipLevel) {
            switch (userOtherData?.VipLevel) {
                case 1:
                    updateVipInfo({ Vip: "ruby", img: "/ruby.png" });
                    break;
                case 2:
                    updateVipInfo({ Vip: "sapphire", img: "/sapphire.png" });
                    break;
                case 3:
                    updateVipInfo({ Vip: "diamond", img: "/diamond.png" });
                    break;
                case 4:
                    updateVipInfo({
                        Vip: "blue diamond",
                        img: "/bluediamond.png",
                    });
                    break;
            }
        }
    }, [userOtherData]);

    useEffect(() => {
        getTransactionData();
    }, []);

    return (
        <Layout>
            <section className="bg-[#F8FCFF] overflow-hidden relative h-[100dvh]">
                {loading && <Loading />}

                <div className="relative text-center py-4 h-[8%] ">
                    <h2 className=" capitalize text-[0.65rem] font-bold my-0">
                        Profile
                    </h2>
                </div>
                <main className=" space-y-1  px-4 ">
                    {/* hero section */}
                    <div
                        style={{
                            background: "url(/profileBg.jpg) center no-repeat",
                            backgroundSize: "cover",
                        }}
                        className=" h-[65%] py-4  w-full relative 
             rounded-[25px]  "
                    >
                        <div className="flex flex-col w-full justify-center items-center py-3">
                            <span
                                className=" size-16
              ring-[3px] relative ring-white overflow-hidden rounded-full "
                            >
                                <Image
                                    style={{ height: "100%", width: "100%" }}
                                    src={
                                        userOtherData?.Avatar
                                            ? `/avatar/${userOtherData?.Avatar}.png`
                                            : "/logo.png"
                                    }
                                    height={40}
                                    unoptimized
                                    width={40}
                                    alt="logo"
                                ></Image>
                            </span>
                            <h2 className="capitalize text-md mt-2 truncate font-bold text-white">
                                {userOtherData?.UserName || "User Name"}
                            </h2>
                        </div>

                        <div
                            onClick={() => updateRecord(true)}
                            className="absolute top-4 left-4 "
                        >
                            <div className="rounded-full flex justify-center items-center size-8 bg-orange-400">
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M1.25 10V16.875C1.25 17.3723 1.44754 17.8492 1.79917 18.2008C2.15081 18.5525 2.62772 18.75 3.125 18.75H16.875C17.3723 18.75 17.8492 18.5525 18.2008 18.2008C18.5525 17.8492 18.75 17.3723 18.75 16.875V10C18.75 9.83424 18.6842 9.67527 18.5669 9.55806C18.4497 9.44085 18.2908 9.375 18.125 9.375C17.9592 9.375 17.8003 9.44085 17.6831 9.55806C17.5658 9.67527 17.5 9.83424 17.5 10V16.875C17.5 17.0408 17.4342 17.1997 17.3169 17.3169C17.1997 17.4342 17.0408 17.5 16.875 17.5H3.125C2.95924 17.5 2.80027 17.4342 2.68306 17.3169C2.56585 17.1997 2.5 17.0408 2.5 16.875V10C2.5 9.83424 2.43415 9.67527 2.31694 9.55806C2.19973 9.44085 2.04076 9.375 1.875 9.375C1.70924 9.375 1.55027 9.44085 1.43306 9.55806C1.31585 9.67527 1.25 9.83424 1.25 10ZM18.75 7.5V6.25C18.75 5.75272 18.5525 5.27581 18.2008 4.92417C17.8492 4.57254 17.3723 4.375 16.875 4.375H9.97563C9.8819 4.37504 9.78936 4.35399 9.70486 4.31342C9.62037 4.27285 9.54608 4.21379 9.4875 4.14062L7.73812 1.95375C7.56257 1.73415 7.33985 1.55686 7.08646 1.43504C6.83308 1.31321 6.55552 1.24997 6.27437 1.25H3.125C2.62772 1.25 2.15081 1.44754 1.79917 1.79917C1.44754 2.15081 1.25 2.62772 1.25 3.125V7.5C1.25 7.66576 1.31585 7.82473 1.43306 7.94194C1.55027 8.05915 1.70924 8.125 1.875 8.125C2.04076 8.125 2.19973 8.05915 2.31694 7.94194C2.43415 7.82473 2.5 7.66576 2.5 7.5V3.125C2.5 2.95924 2.56585 2.80027 2.68306 2.68306C2.80027 2.56585 2.95924 2.5 3.125 2.5H6.27437C6.3681 2.49996 6.46064 2.52101 6.54514 2.56158C6.62963 2.60215 6.70392 2.66121 6.7625 2.73438L8.51188 4.92125C8.68743 5.14085 8.91015 5.31814 9.16354 5.43996C9.41692 5.56179 9.69448 5.62503 9.97563 5.625H16.875C17.0408 5.625 17.1997 5.69085 17.3169 5.80806C17.4342 5.92527 17.5 6.08424 17.5 6.25V7.5C17.5 7.66576 17.5658 7.82473 17.6831 7.94194C17.8003 8.05915 17.9592 8.125 18.125 8.125C18.2908 8.125 18.4497 8.05915 18.5669 7.94194C18.6842 7.82473 18.75 7.66576 18.75 7.5Z"
                                        fill="white"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M4.375 8.125H8.125C8.29076 8.125 8.44973 8.05915 8.56694 7.94194C8.68415 7.82473 8.75 7.66576 8.75 7.5C8.75 7.33424 8.68415 7.17527 8.56694 7.05806C8.44973 6.94085 8.29076 6.875 8.125 6.875H4.375C4.20924 6.875 4.05027 6.94085 3.93306 7.05806C3.81585 7.17527 3.75 7.33424 3.75 7.5C3.75 7.66576 3.81585 7.82473 3.93306 7.94194C4.05027 8.05915 4.20924 8.125 4.375 8.125ZM4.375 13.125H8.125C8.29076 13.125 8.44973 13.0592 8.56694 12.9419C8.68415 12.8247 8.75 12.6658 8.75 12.5C8.75 12.3342 8.68415 12.1753 8.56694 12.0581C8.44973 11.9408 8.29076 11.875 8.125 11.875H4.375C4.20924 11.875 4.05027 11.9408 3.93306 12.0581C3.81585 12.1753 3.75 12.3342 3.75 12.5C3.75 12.6658 3.81585 12.8247 3.93306 12.9419C4.05027 13.0592 4.20924 13.125 4.375 13.125ZM4.375 10.625H15.625C15.7908 10.625 15.9497 10.5592 16.0669 10.4419C16.1842 10.3247 16.25 10.1658 16.25 10C16.25 9.83424 16.1842 9.67527 16.0669 9.55806C15.9497 9.44085 15.7908 9.375 15.625 9.375H4.375C4.20924 9.375 4.05027 9.44085 3.93306 9.55806C3.81585 9.67527 3.75 9.83424 3.75 10C3.75 10.1658 3.81585 10.3247 3.93306 10.4419C4.05027 10.5592 4.20924 10.625 4.375 10.625Z"
                                        fill="white"
                                    />
                                </svg>
                            </div>
                            <p className="capitalize text-[0.5rem] text-white font-bold">
                                records
                            </p>
                        </div>
                    </div>
                    {/* reacharge and balance section */}
                    <div
                        onClick={() => router.push("/profile/recharge")}
                        className="py-6 h-[20%] px-4"
                    >
                        <div className="bg-white py-2 relative ring-1 flex justify-between ring-gray-200 rounded-full p-1">
                            <div className="flex pl-1 justify-center items-center space-x-1">
                                <span
                                    className=" h-full aspect-square rounded-full text-white 
             bg-[#333333] flex text-[0.8rem] p-1 justify-center items-center"
                                >
                                    <FaRupeeSign />
                                </span>

                                <span className="text-sm font-bold pl-3">
                                    {new Intl.NumberFormat("en-US", {
                                        style: "decimal",
                                        maximumFractionDigits: 2,
                                    }).format(userBalance || 0)}
                                </span>
                            </div>

                            <div className="flex pl-1 justify-center flex-row-reverse items-center space-x-1">
                                <span
                                    className=" h-full aspect-square rounded-full  
              text-gray-600 flex text-[0.8rem] p-1 justify-center items-center"
                                >
                                    <LiaAngleRightSolid />
                                </span>

                                <span className="text-sm font-bold pr-3">
                                    Recharge
                                </span>
                            </div>

                            <div className=" absolute h-[140%] bg-[#333333] rounded-full text-white left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] aspect-square flex text-lg justify-center items-center">
                                <FaPlus />
                            </div>
                        </div>
                    </div>
                </main>

                <div
                    style={{ boxShadow: "0px -1px 20px 4px #dddee5" }}
                    className="h-[60%]  shadow-gray-900 rounded-t-[1.5rem]"
                >
                    <div className="w-full  flex justify-center items-center py-4">
                        <h2 className="py-0.5 w-[20%] bg-[#333333] rounded-full"></h2>
                    </div>

                    <div className="h-full space-y-2.5 overflow-y-scroll pb-[15rem] px-4">
                        <div
                            onClick={() => router.push("/profile/commission")}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-2  rounded-[19px]  px-2 bg-[#fff] "
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M27.6968 4.46455L24.1244 0.256934C23.9838 0.0912891 23.7866 0 23.5692 0C23.3519 0 23.1547 0.0912891 23.0141 0.256934L19.4414 4.46473C19.2557 4.68357 19.2153 4.98129 19.3358 5.2418C19.4563 5.50236 19.7096 5.6642 19.9966 5.6642H21.1918V15.1829C20.1501 14.1278 18.8419 13.3363 17.3772 12.92V8.80869H18.5723C18.8593 8.80869 19.1126 8.64691 19.2333 8.38623C19.3539 8.12561 19.3132 7.82777 19.1275 7.60916L15.5551 3.40137C15.4145 3.23572 15.2173 3.14449 15 3.14449C14.7826 3.14449 14.5854 3.23578 14.4448 3.40143L10.8725 7.60898C10.6864 7.82783 10.6459 8.12572 10.7665 8.38617C10.887 8.64674 11.1402 8.80863 11.4274 8.80863H12.6225V12.92C11.1578 13.3363 9.84966 14.1277 8.80798 15.1829V11.9531H10.0031C10.2901 11.9531 10.5434 11.7913 10.6641 11.5307C10.7846 11.2702 10.744 10.9724 10.5582 10.7535L6.98571 6.54592C6.84515 6.38022 6.64792 6.28898 6.43054 6.28898C6.21316 6.28898 6.01599 6.38022 5.87536 6.54586L2.30273 10.7536C2.11693 10.9725 2.0765 11.2703 2.19697 11.5305C2.31755 11.7912 2.57079 11.9531 2.8579 11.9531H4.05304V17.0105C4.05304 17.5551 4.49618 17.9982 5.04075 17.9982H6.94364C6.52575 19.0156 6.29466 20.1287 6.29466 21.295C6.29501 26.095 10.2001 30 15 30C19.7999 30 23.705 26.095 23.705 21.295C23.705 20.1288 23.4739 19.0157 23.056 17.9982H24.9589C25.5035 17.9982 25.9465 17.5552 25.9465 17.0105V5.66414H27.1417C27.4289 5.66414 27.6822 5.50219 27.8025 5.24186C27.9233 4.98135 27.8828 4.68352 27.6968 4.46455ZM13.0914 7.87113H11.8797L15 4.19607L18.1203 7.87113H16.9086C16.7842 7.87113 16.665 7.92052 16.5771 8.00843C16.4892 8.09633 16.4398 8.21556 16.4398 8.33988V12.7097C15.9713 12.6314 15.4904 12.59 15 12.59C14.5096 12.59 14.0286 12.6314 13.5601 12.7097V8.33988C13.5601 8.21556 13.5107 8.09633 13.4228 8.00843C13.3349 7.92052 13.2157 7.87113 13.0914 7.87113ZM5.04111 17.0607C5.02789 17.0604 5.01531 17.055 5.00596 17.0456C4.99661 17.0363 4.99122 17.0237 4.99089 17.0105V11.4844C4.99089 11.3601 4.9415 11.2408 4.8536 11.1529C4.76569 11.065 4.64646 11.0156 4.52214 11.0156H3.31036L6.43072 7.34057L9.55113 11.0156H8.33935C8.21503 11.0156 8.0958 11.065 8.00789 11.1529C7.91998 11.2408 7.8706 11.3601 7.8706 11.4844V16.3061C7.69986 16.5494 7.54167 16.8012 7.39663 17.0607H5.04111ZM15 29.0625C10.717 29.0625 7.23251 25.578 7.23251 21.295C7.23251 17.0121 10.717 13.5275 15 13.5275C19.283 13.5275 22.7675 17.012 22.7675 21.295C22.7675 25.578 19.283 29.0625 15 29.0625ZM25.4778 4.72664C25.3535 4.72664 25.2342 4.77603 25.1463 4.86393C25.0584 4.95184 25.009 5.07107 25.009 5.19539V17.0105C25.009 17.0372 24.9856 17.0607 24.9589 17.0607H22.6034C22.4583 16.8012 22.3001 16.5494 22.1294 16.3061V5.19539C22.1294 5.07107 22.08 4.95184 21.9921 4.86393C21.9042 4.77603 21.785 4.72664 21.6606 4.72664H20.4489L23.5692 1.05158L26.6896 4.72664H25.4778ZM17.6071 22.3893H17.6063C16.4892 22.3896 15.5806 23.2989 15.5809 24.4161C15.5811 24.9573 15.7921 25.4661 16.1749 25.8486C16.5575 26.231 17.0661 26.4415 17.6069 26.4415H17.6078C18.1489 26.4413 18.6577 26.2304 19.0403 25.8476C19.4228 25.4648 19.6334 24.9559 19.6332 24.4147C19.633 23.8734 19.4221 23.3647 19.0393 22.9821C18.6566 22.5998 18.1481 22.3893 17.6071 22.3893ZM18.3772 25.1849C18.2763 25.2864 18.1564 25.3668 18.0242 25.4216C17.8921 25.4764 17.7504 25.5044 17.6074 25.504H17.607C17.3164 25.504 17.0431 25.3909 16.8375 25.1855C16.7361 25.0847 16.6557 24.9648 16.6009 24.8326C16.5461 24.7005 16.5181 24.5589 16.5184 24.4158C16.5182 23.8155 17.0064 23.327 17.6067 23.3268H17.6071C17.8977 23.3268 18.171 23.44 18.3766 23.6454C18.478 23.7462 18.5585 23.8661 18.6132 23.9983C18.668 24.1304 18.696 24.2721 18.6957 24.4151C18.6961 24.5581 18.6682 24.6998 18.6135 24.8319C18.5589 24.9641 18.4785 25.0841 18.3772 25.1849ZM12.3937 20.2007C12.9349 20.2005 13.4436 19.9896 13.8261 19.6068C14.2087 19.224 14.4193 18.7151 14.419 18.174C14.4189 17.6327 14.2079 17.124 13.8251 16.7415C13.4425 16.3591 12.9339 16.1485 12.3929 16.1485H12.3922C11.851 16.1487 11.3422 16.3596 10.9597 16.7424C10.5772 17.1252 10.3666 17.6341 10.3668 18.1753C10.3672 19.2923 11.2761 20.2007 12.393 20.2007H12.3937ZM11.3043 18.1751C11.3041 17.5748 11.7923 17.0862 12.3926 17.0861H12.3929C12.6836 17.0861 12.9569 17.1992 13.1624 17.4046C13.2639 17.5055 13.3443 17.6254 13.3991 17.7575C13.4539 17.8897 13.4819 18.0313 13.4815 18.1744C13.482 18.3174 13.4541 18.4591 13.3994 18.5912C13.3447 18.7233 13.2643 18.8433 13.163 18.9442C13.0621 19.0456 12.9422 19.126 12.8101 19.1808C12.678 19.2356 12.5363 19.2636 12.3933 19.2633H12.3929C11.7929 19.2632 11.3045 18.7751 11.3043 18.1751ZM18.3465 17.4755L12.5098 25.6044C12.4663 25.6649 12.4091 25.7142 12.3428 25.7482C12.2765 25.7822 12.2031 25.7998 12.1286 25.7997C12.0424 25.7996 11.9579 25.7758 11.8844 25.7308C11.8108 25.6858 11.7511 25.6214 11.7118 25.5447C11.6725 25.468 11.6551 25.3819 11.6615 25.296C11.668 25.21 11.698 25.1275 11.7483 25.0575L17.585 16.9287C17.6209 16.8787 17.6663 16.8362 17.7186 16.8038C17.7709 16.7713 17.8291 16.7494 17.8898 16.7395C17.9505 16.7295 18.0127 16.7316 18.0726 16.7456C18.1325 16.7597 18.1891 16.7854 18.2391 16.8213C18.3401 16.8938 18.4081 17.0035 18.4283 17.1262C18.4484 17.2489 18.419 17.3745 18.3465 17.4755Z"
                                        fill="black"
                                    />
                                </svg>
                            </div>

                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                commission center
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </div>

                        <div
                            onClick={() => router.push("/profile/withdrawal")}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-2  rounded-[19px]  px-2 bg-[#fff] "
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M16.8863 12.7387C16.7024 12.5653 16.5108 12.4334 16.2766 12.3416C16.0425 12.2504 15.8203 12.1487 15.3516 12.0377V9.99935C15.8203 10.1342 15.9882 10.4052 16.0929 10.8128C16.1852 11.1597 16.3783 11.3326 16.6902 11.3326C16.8557 11.3326 16.992 11.2728 17.1085 11.1535C17.2245 11.0343 17.2806 10.8933 17.2806 10.7295C17.2806 10.5826 17.2403 10.4217 17.1627 10.2441C17.0842 10.068 16.9733 9.89722 16.8297 9.73017C16.6487 9.51126 16.4534 9.34808 16.2097 9.24032C15.9666 9.13315 15.8203 9.06097 15.3516 9.02534V8.6664C15.3516 8.39833 15.2012 8.26392 14.9975 8.26392C14.7974 8.26392 14.6484 8.40185 14.6484 8.67565V9.02534C14.0039 9.08423 13.5169 9.29253 13.1684 9.65212C12.82 10.0109 12.6612 10.4721 12.6612 11.0341C12.6612 11.465 12.7576 11.8177 12.936 12.0917C13.1139 12.3661 13.3196 12.5779 13.6062 12.7266C13.8927 12.8749 14.1797 13.0097 14.6484 13.13V15.4088C14.4141 15.3469 14.2949 15.2567 14.1662 15.1397C14.0371 15.0217 13.9557 14.8916 13.8926 14.7494C13.8291 14.6076 13.762 14.4029 13.676 14.1347C13.6378 14.0107 13.5734 13.9143 13.4743 13.8458C13.3759 13.777 13.2572 13.7428 13.1139 13.7428C12.9355 13.7428 12.7881 13.8061 12.6685 13.9309C12.5489 14.0575 12.49 14.1981 12.49 14.3553C12.49 14.5676 12.5346 14.7838 12.6243 15.0045C12.7129 15.225 12.8508 15.4369 13.0368 15.6416C13.2234 15.8454 13.4249 16.0161 13.7032 16.1529C13.9817 16.291 14.1799 16.3804 14.6486 16.4227V16.7975C14.6486 16.9473 14.7023 17.0575 14.7488 17.1299C14.7945 17.2018 14.8907 17.2381 15.0049 17.2381C15.129 17.2381 15.2348 17.1937 15.2713 17.1057C15.3081 17.0171 15.3517 16.877 15.3517 16.6842V16.4135C15.8791 16.3735 16.1819 16.2519 16.5132 16.0455C16.8441 15.8397 17.086 15.5751 17.2563 15.2498C17.4264 14.9251 17.5069 14.5755 17.5069 14.2031C17.5069 13.9063 17.4516 13.6329 17.3452 13.3828C17.2385 13.133 17.0842 12.9183 16.8863 12.7387ZM14.6484 11.8571C14.4141 11.7487 14.1796 11.6285 14.0398 11.4964C13.8995 11.3638 13.845 11.1696 13.845 10.9109C13.845 10.6402 13.8969 10.4369 14.0464 10.3035C14.1953 10.1701 14.414 10.062 14.6484 9.98071V11.8571H14.6484ZM16.0788 15.0607C15.9036 15.2599 15.8203 15.3925 15.3516 15.4575V13.312C15.8203 13.4198 15.9155 13.5515 16.0856 13.706C16.2557 13.8615 16.3409 14.0812 16.3409 14.3646C16.3409 14.6296 16.2536 14.8622 16.0788 15.0607Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M27.6048 14.2931C27.4492 13.6487 27.0766 12.4114 26.6569 11.0518C28.3165 10.8427 29.6014 9.42393 29.6014 7.70748C29.6014 5.84748 28.0921 4.33594 26.232 4.33594H3.76805C1.90782 4.33594 0.39856 5.8548 0.39856 7.7148C0.39856 9.40072 1.63799 10.8031 3.25483 11.0504C2.8551 12.2283 2.50225 13.2914 2.32612 13.9583C1.77012 16.0633 0.39856 20.2148 0.39856 20.2148H1.56258C1.48489 21.0352 1.44375 21.7383 1.44375 22.9688C1.65909 22.9688 2.16874 22.9688 2.90168 22.9688C2.83917 23.7891 2.80606 24.6094 2.80606 25.7227C4.51583 25.7227 26.8112 25.7227 26.8112 25.7227C26.8112 25.7227 26.9004 24.6094 26.7835 22.9688C27.6606 22.9688 28.1698 22.9688 28.1698 22.9688C28.1698 22.9688 28.2743 21.9727 28.1278 20.2148H29.2859C29.2859 20.2148 28.4206 17.6721 27.6048 14.2931ZM3.97295 24.375C3.98948 23.9648 4.0193 23.3789 4.05791 22.9688C9.26866 22.9688 20.5646 22.9688 25.6264 22.9688C25.6684 23.6133 25.6869 24.1406 25.6924 24.375H3.97295ZM2.74377 21.6797C2.76475 21.1523 2.80131 20.6836 2.85206 20.2148H26.8398C26.8944 20.8594 26.9174 21.3281 26.9241 21.6797H2.74377ZM2.15415 18.8086C2.60461 17.5195 3.22254 15.4971 3.55963 14.2213C3.97536 12.6473 5.44665 8.5902 6.09006 6.81791L23.9849 6.8301C24.6014 8.7365 26.0275 13.125 26.3646 14.5213C26.7873 16.2717 27.2198 17.8124 27.5447 18.8085H2.15415V18.8086Z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                payment withdrawal
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </div>

                        {/* <div
                            onClick={() => router.push("/profile/editpassword")}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-2  rounded-[19px] bg-[#fff]  px-2"
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 40 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M28.1531 17.8126H27.1875V13.9345C27.1875 10.1845 24.3938 6.93133 20.6594 6.59383C19.6604 6.50609 18.654 6.62756 17.7046 6.95049C16.7552 7.27341 15.8835 7.7907 15.1451 8.46935C14.4068 9.148 13.818 9.97311 13.4164 10.892C13.0148 11.8109 12.8091 12.8035 12.8125 13.8063V17.8126H11.8469C11.1913 17.8126 10.5626 18.073 10.099 18.5366C9.63543 19.0001 9.375 19.6289 9.375 20.2845V30.9657C9.375 31.6213 9.63543 32.25 10.099 32.7136C10.5626 33.1772 11.1913 33.4376 11.8469 33.4376H28.1531C28.8087 33.4376 29.4374 33.1772 29.901 32.7136C30.3646 32.25 30.625 31.6213 30.625 30.9657V20.2845C30.625 19.6289 30.3646 19.0001 29.901 18.5366C29.4374 18.073 28.8087 17.8126 28.1531 17.8126ZM14.375 13.8063C14.3716 13.0205 14.5321 12.2427 14.8461 11.5224C15.1602 10.8021 15.621 10.1551 16.1991 9.62291C16.7772 9.09068 17.4599 8.68481 18.2037 8.43122C18.9475 8.17762 19.7359 8.08188 20.5188 8.15008C23.4375 8.41258 25.625 10.9626 25.625 13.8938V17.8126H14.375V13.8063ZM10.9375 20.2845C10.9375 20.0433 11.0333 19.812 11.2038 19.6414C11.3744 19.4709 11.6057 19.3751 11.8469 19.3751H28.1531C28.3943 19.3751 28.6256 19.4709 28.7962 19.6414C28.9667 19.812 29.0625 20.0433 29.0625 20.2845V28.4376H10.9375V20.2845ZM28.1531 31.8751H11.8469C11.6057 31.8751 11.3744 31.7793 11.2038 31.6087C11.0333 31.4382 10.9375 31.2069 10.9375 30.9657V30.0001H29.0625V30.9657C29.0625 31.2069 28.9667 31.4382 28.7962 31.6087C28.6256 31.7793 28.3943 31.8751 28.1531 31.8751Z"
                                        fill="black"
                                    />
                                    <path
                                        d="M14.375 23.125H16.5625V25.3125H14.375V23.125ZM18.75 23.125H20.9375V25.3125H18.75V23.125ZM23.4375 23.125H25.625V25.3125H23.4375V23.125Z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                change password
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </div> */}

                        <div
                            onClick={() => router.push("/profile/help")}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-2  rounded-[19px] bg-[#fff] px-2"
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <svg
                                    width="25"
                                    height="25"
                                    viewBox="0 0 30 30"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M26.2584 13.0238H25.0378V12.2185C25.0378 6.68348 20.535 2.18066 14.9991 2.18066C9.46312 2.18066 4.96125 6.68348 4.96125 12.2185V13.0238H3.74156C2.71031 13.0238 1.875 13.8591 1.875 14.8904V19.0154C1.875 20.0457 2.71031 20.881 3.74156 20.881H5.96344C6.34219 20.881 6.64875 20.5744 6.64875 20.1957C6.64875 17.5369 6.64875 14.8772 6.64875 12.2185C6.64875 7.61348 10.395 3.86816 15 3.86816C19.605 3.86816 23.3513 7.61441 23.3513 12.2185C23.3513 14.2725 23.3513 16.3266 23.3513 18.3816C23.3513 19.2225 23.3513 20.0635 23.3513 20.9044C23.3513 22.6904 21.8981 24.1444 20.1112 24.1444H17.2416C16.9238 23.4694 16.2422 22.9997 15.4472 22.9997H14.5519C13.4541 22.9997 12.5634 23.8904 12.5634 24.9882C12.5634 26.086 13.4541 26.9766 14.5519 26.9766H15.4472C16.2422 26.9766 16.9238 26.506 17.2416 25.8319H20.1103C22.8272 25.8319 25.0369 23.6222 25.0369 20.9054V20.8819H26.2575C27.2878 20.8819 28.1241 20.0466 28.1241 19.0163V14.8913C28.125 13.8591 27.2897 13.0238 26.2584 13.0238Z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                get help
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </div>

                        <a
                            download={"cb-football.apk"}
                            href={"/downloads/cb-football.apk"}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-3  rounded-[19px] bg-[#fff]  px-2"
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <svg
                                    width="25"
                                    height="20"
                                    viewBox="0 0 30 25"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g clipPath="url(#clip0_194_293)">
                                        <path
                                            d="M26.875 20H19.375V20.625C19.3534 21.1622 19.1848 21.6832 18.8875 22.1312C18.4727 22.787 17.8987 23.3272 17.219 23.7015C16.5393 24.0758 15.776 24.2721 15 24.2721C14.224 24.2721 13.4607 24.0758 12.781 23.7015C12.1013 23.3272 11.5273 22.787 11.1125 22.1312C10.8152 21.6832 10.6466 21.1622 10.625 20.625V20H3.125M26.875 20V28.125H3.125V20M26.875 20L24.375 10H18.75M26.875 20H20M3.125 20L5.625 10H11.25M15 19.375V1.875M15 19.375L12.5 16.25M15 19.375L17.5 16.25"
                                            stroke="black"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_194_293">
                                            <rect
                                                width="30"
                                                height="30"
                                                fill="white"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                app download
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </a>

                        <div
                            onClick={logout}
                            style={{
                                boxShadow: "0px 2px 8px 1px rgb(0,0,0,0.1) ",
                            }}
                            className="flex  items-center py-2  rounded-[19px] bg-[#fff] px-2 text-red-600 "
                        >
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <IoMdLogOut className="text-red-500 text-[1.7rem] " />
                            </div>
                            <div className="h-full w-full flex-[4] capitalize font-bold text-[0.75rem]">
                                Logout
                            </div>
                            <div className="h-full w-full flex justify-center items-center flex-[1]">
                                <LiaAngleRightSolid />
                            </div>
                        </div>
                    </div>
                </div>

                {/* record popup */}
                {getRecord && (
                    <div className="absolute top-0 left-0 h-[100dvh] w-full bg-[#F8FCFF]">
                        {/* header */}
                        <div className="h-[10%] flex justify-center relative items-center">
                            <span className="font-bold capitalize text-sm">
                                records
                            </span>
                            <span
                                onClick={() => updateRecord(false)}
                                className="space-x-2 absolute top-[50%] translate-y-[-50%] left-2 flex justify-center items-center font-semibold text-sm"
                            >
                                <LiaAngleLeftSolid />
                                Back
                            </span>
                        </div>
                        <div className="h-[10%]">
                            <div className=" h-[60px] w-[90%] flex mr-auto ml-auto rounded-[10px] relative  bg-[#e8e8e8] ">
                                <div
                                    onClick={() => setSwipe(1)}
                                    className={`flex-[1] z-[3] flex justify-center items-center text-sm capitalize ${
                                        swipe === 1 ? " font-bold " : "  "
                                    }`}
                                >
                                    Deposit
                                </div>
                                <div
                                    onClick={() => setSwipe(2)}
                                    className={`flex-[1] z-[3] flex justify-center items-center text-sm capitalize ${
                                        swipe === 2 ? " font-bold " : "  "
                                    }`}
                                >
                                    withdrawal
                                </div>
                                <div
                                    onClick={() => setSwipe(3)}
                                    className={`flex-[1] z-[3] flex justify-center items-center text-sm capitalize ${
                                        swipe === 3 ? " font-bold " : "  "
                                    }`}
                                >
                                    overall
                                </div>
                                {/* toggler */}
                                <div className="h-full grid grid-cols-3 justify-center w-full absolute top-0 p-1">
                                    <div
                                        style={{ gridColumnStart: swipe }}
                                        className={`col-span-1 rounded-md   bg-white z-[1]`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        {/* popup display make the same for withdrawal and overall the data will be fetched here in this file and transfered to the recordAccordian file */}
                        <section
                            ref={dataBox}
                            className="max-h-[80%] overflow-y-scroll pt-6 pb-40 px-4"
                        >
                            {transactionData?.map((item, idx) => {
                                if (swipe === 1 && item?.Type === "deposit" || item?.Type === 'gateway') {
                                    //  deposit type
                                    return (
                                        <RecordAccordians
                                            key={item?._id}
                                            idx={idx}
                                            details={{
                                                "transaction id":
                                                    item?.TransactionId,
                                                "recharge method": item?.Method,
                                                remark: item?.Remark,
                                            }}
                                            cardDetails={item}
                                        />
                                    );
                                } else if (
                                    swipe === 2 &&
                                    item?.Type === "withdrawal"
                                ) {
                                    //withdraw type
                                    return (
                                        <RecordAccordians
                                            key={item?._id}
                                            idx={idx}
                                            details={{
                                                "transaction id":
                                                    item?.TransactionId,
                                                "withdrawal method":
                                                    item?.Method,
                                                // remark: item?.Remark,
                                                "Handling fee": (
                                                    (Number(item?.Amount) /
                                                        10000) *
                                                    10
                                                ).toFixed(2),
                                            }}
                                            cardDetails={item}
                                        />
                                    );
                                } else if (
                                    swipe === 3 &&
                                    item?.Type !== "withdrawal" &&
                                    item?.Type !== "deposit"
                                ) {
                                    //overall
                                    return (
                                        <RecordAccordians
                                            key={item?._id}
                                            idx={idx}
                                            details={{
                                                username: item?.UserName,
                                                Remark: item?.Remark,
                                            }}
                                            cardDetails={item}
                                        />
                                    );
                                }
                                // <RecordAccordians key={idx} idx={idx} cardDetails={item} />;
                            })}

                            <p
                                ref={noData}
                                hidden={!(childrens <= 0)}
                                style={{
                                    height: "20rem",
                                    background:
                                        "url(/noData.svg) center no-repeat",
                                }}
                            ></p>
                        </section>
                    </div>
                )}
            </section>
        </Layout>
    );
}

export default Page;
