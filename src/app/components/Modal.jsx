import Image from "next/image";
import React, { useContext } from "react";
import { AlertContext } from "../helpers/AlertContext";
// { message, onClose ,status ,statusImage}
function Modal() {
  let { AlertDetails, closeAlert } = useContext(AlertContext);
  return (
    <section
      // isOpen={isOpen}
      // onRequestClose={onClose}
      className="fixed top-0 left-0 z-[9999] grid place-items-center h-screen w-screen backdrop-blur-md "
    >
      <div className="w-[65%] h-[40%]  bg-[#ffffffa2] flex rounded-[15px] ">
        <div className="flex place-items-center  w-full justify-center relative ">
          <div className="flex flex-col text-black place-items-center justify-around  h-[65%] ">
            <Image
              src={AlertDetails?.image || "/logo.png"}
              alt="logo"
              width={70}
              height={70}
            />
            <h1 className=" font-extrabold capitalize  ">
              {AlertDetails?.status === "opps"
                ? "opps!"
                : AlertDetails?.status || "pending"}
            </h1>
            <p className="w-[95%] text-[.7rem] text-center capitalize ">
              {AlertDetails?.message || "Loading.."}
            </p>
          </div>

          <button
            onClick={closeAlert}
            className="border-t-2 capitalize border-[#00000033] absolute bottom-0 w-full py-2 text-[#2885F6] font-semibold "
          >
            Done
          </button>
        </div>
      </div>
    </section>
  );
}

export default Modal;
