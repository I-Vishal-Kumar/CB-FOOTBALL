"use client";
import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Input from "@/app/components/Input";
import { motion } from "framer-motion";
import VerificationPopup from "@/app/components/VerificationPopup";
import { AlertContext } from "@/app/helpers/AlertContext";
import Modal from "@/app/components/Modal";
import { useRouter } from "next/navigation";
import OlarkChat from "@/app/components/LiveChats/OlarkChat";

const containerVariant = {
    hidden: {
        opacity: 1,
    },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.1,
            staggerChildren: 0.1,
        },
    },
};
const itemVariant = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
};
const Login = () => {
    const { getAlert, isActive } = useContext(AlertContext);

    const [credentials, updateCredentials] = useState({
        UserName: "",
        Password: "",
    });
    const [resetPassword, toggleVerification] = useState(false);

    function update(e) {
        updateCredentials((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }
    const sendData = async (e) => {
        e.preventDefault();
        getAlert();
        let config = {
            method: "POST",
            contentType: "application/json",

            body: JSON.stringify(credentials),
        };
        let res = await fetch(`/api/access`, config);
        res = await res.json();
        if (res?.status === 200) {
            getAlert("success", "login successfull");
            window.location.href = window.location.origin;
        } else {
            getAlert("opps", res?.message || "something went wrong");
        }
    };

    return (
        <>
            <div className="flex text-white relative min-h-screen  flex-col justify-center px-6 pb-[8rem] lg:px-8">
                <div className="absolute blur-[2px] top-0 left-0 z-[-1]  h-full w-full">
                    <Image fill alt="company logo" src={"/login_bg.jpg"} />
                </div>
                <div className="sm:mx-auto pt-0 sm:w-full sm:max-w-sm">
                    <Image
                        className="mx-auto"
                        src={"/logo.png"}
                        height={120}
                        width={130}
                        alt="C.B football"
                    />
                    <h2 className=" text-center text-md font-bold leading-9 tracking-tight to-blue-500 uppercase">
                        Welcome back
                    </h2>
                </div>

                <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-4" onSubmit={sendData}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariant}
                            className="space-y-4"
                        >
                            <motion.div variants={itemVariant}>
                                <label
                                    htmlFor="User"
                                    className="block text-sm font-bold leading-0 text-balance"
                                >
                                    Username
                                </label>
                                <Input
                                    credentials={credentials}
                                    inputType="text"
                                    image="user.png"
                                    id="UserName"
                                    update={update}
                                />
                            </motion.div>

                            <motion.div variants={itemVariant}>
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-bold leading-6 text-white"
                                    >
                                        Password
                                    </label>
                                </div>
                                <Input
                                    credentials={credentials}
                                    inputType="password"
                                    id="Password"
                                    image="lock.png"
                                    update={update}
                                />
                                <div className="mt-2">
                                    <div className="text-sm flex uppercase justify-between">
                                        <a
                                            href="#"
                                            className="font-semibold text-slate-500 hover:text-slate-400"
                                        ></a>
                                        <a
                                            // onClick={() =>
                                            //     toggleVerification(true)
                                            // }
                                            className="font-semibold text-slate-500 hover:text-slate-400"
                                        ></a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-[#11468F] px-3 py-[0.6rem] font-semibold leading-6 text-white shadow-sm"
                            >
                                Login
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center font-semibold text-sm">
                        Customer support /
                        <a
                            href="https://t.me/Bharat_Goal"
                            className="font-semibold leading-6 hover:text-blue-800"
                        >
                            Telegram
                        </a>
                    </p>
                    <p className="mt-2 text-center font-semibold text-sm">
                        Signup/
                        <a
                            href="/access/signup"
                            className="font-semibold leading-6 hover:text-blue-800"
                        >
                            Create New Account
                        </a>
                    </p>
                </div>
                {resetPassword && (
                    <VerificationPopup
                        toggleVerification={toggleVerification}
                    />
                )}
                {isActive && <Modal />}
            </div>
            {/* <OlarkChat /> */}
        </>
    );
};

export default Login;
