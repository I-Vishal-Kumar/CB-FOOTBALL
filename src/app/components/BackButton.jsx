"use client";
import React from "react";
import { MdOutlineArrowBackIos } from "react-icons/md";

function BackButton({ pageName }) {
  return (
    <div className="flex  relative   justify-center place-items-center  ">
      <h4 className=" text-[0.65rem] font-bold ">
        {" "}
        {pageName ? pageName : "undefined"}{" "}
      </h4>
      <p className="absolute left-2 text-sm font-bold  flex place-items-center ">
        <MdOutlineArrowBackIos className="text-[1rem] " /> Back
      </p>
    </div>
  );
}

export default BackButton;
