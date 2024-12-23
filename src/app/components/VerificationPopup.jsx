import React, { useContext, useState } from "react";
import Image from "next/image";
import { easeInOut, motion } from "framer-motion";
import Input from "./Input";
import { FaPlay } from "react-icons/fa6";
import OtpInputs from "./OtpInputs";
import Layout from "./Layout";
import { AlertContext } from "../helpers/AlertContext";
import Modal from "./Modal";

const VerificationPopup = ({ toggleVerification }) => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [isVerified, setVerified] = useState(false);
  const [UserName, updateUserName] = useState("");
  const [otpSent, updateOtpSent] = useState(false);
  const [verifPhone, updateVerifType] = useState(true);
  const [credentials, updateCredentials] = useState({
    confPassword: "",
    Password: "",
  });
  let { getAlert, isActive } = useContext(AlertContext);

  function verify() {
    let EnteredOtp = otp.join("");
    EnteredOtp = Number(EnteredOtp);
    let cookies = document.cookie;
    let providedOtp;
    const [name, value] = cookies.split("=");
    if (name === "otp") {
      providedOtp = value;
    }
    if (EnteredOtp === Number(providedOtp)) {
      getAlert("success", "otp verification successfull 🎉 .");
      setVerified(true);
    }
  }

  function update(e) {
    updateCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function getOtp() {
    getAlert();
    try {
      if (!UserName) {
        getAlert("user name is required to get a verificatioin message");
        return;
      }
      let config = {
        method: "PUT",
        header: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ UserName }),
      };
      let res = await fetch(
        "/api/otp/" + `${verifPhone ? "phone" : "email"}`,
        config
      );
      res = await res.json();
      if (res?.status === 200) {
        updateOtpSent(true);
        getAlert("success", "Otp sent successfully to your device.");
      } else {
        getAlert("opps", res?.message || "something went wrong");
      }
    } catch (error) {
      getAlert("opps", "something went wrong");
    }
  }

  async function resetPassword() {
    getAlert();
    try {
      if (!isVerified) {
        getAlert("opps", "verification is required to reset the password");
        return;
      }
      if (credentials?.confPassword !== credentials?.Password) {
        getAlert("opps", "both password inputs are not matching .");
        return;
      } else if (!UserName) {
        getAlert("user name is required to get a verificatioin message");
        return;
      }

      let config = {
        method: "POST",
        header: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ UserName, Password: credentials?.Password }),
      };
      let res = await fetch("/api/access/resetPassword", config);
      res = await res.json();
      if (res?.status === 200) {
        toggleVerification(false);
        getAlert("redirect", res?.message || "successfull");
      } else {
        getAlert("opps", res?.message || "something went wrong.");
      }
    } catch (error) {
      getAlert("opps", "something went wrong.");
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full absolute top-0 left-0 flex justify-center items-end bg-black/70 w-full"
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className=" h-[80%] pt-6 pb-40  bg-[#f8fbfe] overflow-y-auto rounded-t-[2rem] w-[98%]"
        >
          <div className="flex  relative px-2  justify-center">
            <h4 className="uppercase text-center font-bold">
              otp verification
            </h4>
            <p
              className="absolute right-2 font-bold top-[-0.5rem] p-2"
              onClick={() => toggleVerification(false)}
            >
              X
            </p>
          </div>

          <div className="px-14 mt-4">
            <h3 className="font-bold text-xs  capitalize">
              select prefered method for verification
            </h3>
          </div>
          <div className="flex flex-col items-center mt-1 space-y-3">
            <div className="flex items-center w-[70%] px-2 justify-between bg-[#ffffff] rounded-md ">
              <h3 className="font-semibold py-3  text-xs">
                Phone Verification
              </h3>
              <input
                type="radio"
                checked={verifPhone}
                onChange={() => updateVerifType(true)}
                className=" border-2 size-4 border-solid border-blue-600"
                name="verificationType"
                id=""
              />
            </div>
            <div className="flex items-center w-[70%] px-2 justify-between bg-[#ffffff] rounded-md ">
              <h3 className="font-semibold py-3  text-xs">
                Email Verification
              </h3>
              <input
                type="radio"
                checked={!verifPhone}
                onChange={() => updateVerifType(false)}
                className=" border-2 size-4 border-solid border-blue-600"
                name="verificationType"
                id=""
              />
            </div>
          </div>
          <div className="mx-auto w-[70%] pb-2 mt-1 rounded-md">
            <div className="flex capitalize font-semibold text-[0.65rem] space-x-2 ">
              <div className=" flex w-[70%] space-x-2 px-2">
                <div className="flex space-x-1 mt-2 flex-row items-center justify-between mx-auto w-full ">
                  <div className=" h-10 ">
                    <input
                      placeholder="Enter user name"
                      className="w-full ring-[1.2px] h-full px-5 outline-none rounded-md border border-gray-300 text-sm bg-white focus:bg-gray-50 focus:ring-1 ring-blue-600"
                      type="text"
                      value={UserName}
                      onChange={(e) => updateUserName(e.target.value)}
                      name=""
                    />
                  </div>
                </div>
              </div>
              <div className=" flex  flex-col justify-end  w-[30%] space-y-2 text-center px-0">
                {otpSent ? (
                  <>
                    <span
                      onClick={getOtp}
                      className="  
            flex text-[0.7rem] justify-center items-center"
                    >
                      <Image
                        src={"/tick_mark.png"}
                        alt="sent"
                        width={25}
                        height={25}
                      />
                    </span>
                    <div className="flex text-center justify-center text-xs items-center h-[20%]">
                      <p>Resend OTP</p>
                      <FaPlay />
                    </div>
                  </>
                ) : (
                  <div
                    onClick={getOtp}
                    className="rounded-md bg-blue-500 shadow-sm  px-2 h-10 flex justify-center items-center text-[0.7rem] py-0.5 text-white uppercase"
                  >
                    send
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-2 px-8 flex-row items-center justify-between mx-auto w-full max-w-xs">
            <OtpInputs otp={otp} setOtp={setOtp} />
          </div>

          <div className="px-14 mt-2">
            <div
              onClick={verify}
              className=" bg-gradient-to-r p-[2px] rounded-md from-blue-700 to-slate-950"
            >
              <button className="h-full font-bold py-2 rounded-md w-full bg-slate-100">
                VERIFY
              </button>
            </div>
          </div>
          <div className="px-5 mt-4">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold leading-6 text-black"
                >
                  New Password
                </label>
              </div>
              <Input
                credentials={credentials}
                inputType="password"
                id="Password"
                image="lock.png"
                update={update}
              />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm capitalize font-semibold leading-6 text-black"
                >
                  confirm Password
                </label>
              </div>
              <Input
                credentials={credentials}
                inputType="text"
                id="confPassword"
                image="lock.png"
                update={update}
              />
            </div>
          </div>
          <div onClick={resetPassword} className="px-5 mt-3">
            <button className=" rounded-md text-white font-bold tracking-wider capitalize w-full py-3 bg-blue-500">
              reset password
            </button>
          </div>
        </motion.div>
      </motion.div>
      {isActive && <Modal />}
    </>
  );
};

export default VerificationPopup;
