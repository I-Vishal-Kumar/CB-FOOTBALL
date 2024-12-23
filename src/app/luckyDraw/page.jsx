"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../helpers/UserContext";
import { AlertContext } from "../helpers/AlertContext";
import Modal from "../components/Modal";
import { FaIndianRupeeSign } from "react-icons/fa6";

const colorWheel = [
  { value: 1, bg: "#ff3737" },
  { value: 14, bg: "#f0b842" },
  { value: 12, bg: "#ff3737" },
  { value: 56, bg: "#f0b842" },
  { value: 9, bg: "#ff3737" },
  { value: 5, bg: "#f0b842" },
  { value: 3, bg: "#ff3737" },
  { value: 7, bg: "#f0b842" },
];
// one section is of 40 deg if the tracker is in middle its at 0 deg
const values = [14, 1, 7, 3, 5, 9, 56, 12];

const Page = () => {
  const [rotate, updateRotate] = useState(0);
  const [winningAmount, updateWinningAmount] = useState(0);
  const { getBalance, userOtherData } = useContext(UserContext);
  const { getAlert, isActive } = useContext(AlertContext);
  const wheel = useRef();

  function startRotate() {
    const startRotating = setInterval(() => {
      updateRotate((prev) => prev + 5.4);
    }, 15);
    setTimeout(() => {
      clearInterval(startRotating);
      let newRotation = Math.floor(Math.ceil(Math.random() * 5)) * 44;
      updateRotate(newRotation);
      updateWinningAmount(values[newRotation / 44]);
      setTimeout(() => {
        claimAmount(values[newRotation / 44]);
      }, 1000);
    }, 4.5 * 1000);
  }

  useEffect(() => {
    if (wheel.current) {
      wheel.current.style.transform = `rotate(${rotate}deg)`;
    }
  }, [rotate]);

  async function claimAmount(amount) {
    getAlert();
    try {
      let config = {
        method: "POST",
        header: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Amount: amount }),
      };
      let res = await fetch("/api/spinner", config);
      if (res?.ok) {
        res = await res.json();
        if (res?.status === 200) {
          await getBalance();
          getAlert(
            "success",
            `reward of ${amount} has been credited to your account.`
          );
          return;
        } else if (res?.status === 302) {
          getAlert("redirect", "login session time out ");
          return;
        } else {
          getAlert("opps", res?.message || "something went wrong");
        }
      }
    } catch (error) {
      getAlert("redirect", "login session time out ");
    }
  }

  return (
    <>
      <main
        style={{
          background: `url(/spinner_bg.png) center no-repeat`,
          backgroundSize: "cover",
        }}
        className="flex h-screen items-center flex-col bg-blue-600 "
      >
        <div className="min-h-[30%] flex justify-center items-center">
          <div className="text-xl capitalize text-white">lucky wheel</div>
        </div>
        <div className="min-h-[70%]">
          <div className="relative">
            <div
              onClick={
                userOtherData?.Spin === new Date().getDate()
                  ? null
                  : startRotate
              }
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50% , -50%)",
              }}
              className="h-[3rem] z-[10] before:border-b-[0.8rem] before:border-transparent before:border-r-8 before:border-b-purple-900 before:absolute before:bottom-[95%] before:border-l-8 absolute flex justify-center items-center aspect-square bg-purple-900 ring-2 ring-white rounded-full  text-white font-extrabold text-sm "
            >
              <p>TAP</p>
            </div>
            {/* decor */}
            <div
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50% , -50%)",
              }}
              className="h-[85%] absolute z-[3] flex justify-center items-center aspect-square bg-transparent border-[0.23rem] border-dotted border-white rounded-full"
            ></div>
            <div
              ref={wheel}
              className="h-[15rem] aspect-square rounded-full border-1 border-solid border-black shadow-xl bg-blue-200 flex justify-center overflow-hidden items-center relative "
            >
              <div className="h-full flex items-center justify-center z-[2] w-full  rounded-full bg-pink-400 ">
                {/* triangles */}
                {colorWheel.map((ele, idx) => (
                  <div
                    key={idx}
                    style={{
                      transform: `rotate(${45 * idx + 1}deg)`,
                      clipPath: "polygon(0 0, 60% 0, 100% 100% , 0 60%)",
                      background: ele?.bg,
                    }}
                    className=" origin-bottom-right border-2 border-solid  absolute w-1/2 h-1/2 top-0 left-0 flex justify-center items-center"
                  >
                    <span className="rotate-[-45deg] flex text-white font-bold">
                      <FaIndianRupeeSign />
                      {ele?.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-20 flex flex-col justify-center items-center text-white bg-[#192b74aa] mt-0.5 rounded-xl">
            {userOtherData?.Spin === new Date().getDate() ? (
              <p>Today spin limit reached</p>
            ) : (
              <>
                <p>You have won</p>
                <span className="flex">
                  {" "}
                  <FaIndianRupeeSign />
                  {winningAmount}
                </span>
              </>
            )}
          </div>
        </div>
      </main>
      {isActive && <Modal />}
    </>
  );
};

export default Page;
