"use client";

import { isDragActive, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export default function RecordAccordians({ details, cardDetails, idx }) {
  const [isActive, setActive] = useState(false);
  const [createdAt, updateCreatedAt] = useState(null);
  useEffect(() => {
    updateCreatedAt(new Date(cardDetails?.createdAt) || new Date());
  }, []);
  return (
    <div className="bg-white mb-4 w-full px-6 py-2 shadow-md rounded-md">
      <div className="flex justify-between ">
        <div className="space-y-0.5">
          <h2 className="font-bold capitalize text-sm">
            {cardDetails?.Type || "not available"}
          </h2>
          <h2 className=" text-gray-600 capitalize text-xs">
            {createdAt &&
              `${createdAt.getDate()}/${
                createdAt.getMonth() + 1
              }/${createdAt?.getFullYear()} ${createdAt?.getHours()}:${createdAt?.getMinutes()}`}
          </h2>
        </div>
        <div className="flex space-x-4">
          <div className="text-end">
            <h2 className="font-bold capitalize text-sm">
              {Number(cardDetails?.Amount) / 100}
            </h2>
            <h2
              style={{ color: cardDetails?.Status === 1 ? "#38ff3e" : "red" }}
              className="font-medium capitalize text-[0.7rem]"
            >
              {cardDetails?.Status === 0
                ? "Pending"
                : cardDetails?.Status === 1
                ? "success"
                : "canceled"}
            </h2>
          </div>
          <div
            onClick={() => setActive((prev) => !prev)}
            className=" flex justify-end h-fit"
          >
            <span className="p-[0.1rem] bg-gray-300 text-gray-600 rounded-full">
              {isActive ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </div>
        </div>
      </div>
      {isActive && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-5 capitalize text-[0.56rem] space-y-[1.25px] text-black font-medium"
        >
          {cardDetails?.Type === "invitation reward" && (
            <span className="flex space-x-1 text-thin">
              <p>From - </p>
              <p>{cardDetails?.From}</p>
            </span>
          )}
          {Object.keys(details)?.map((key, idx) => {
            if (
              cardDetails?.Type === "invitation reward" &&
              key !== "username"
            ) {
              return (
                <span
                  key={`subList-${idx}`}
                  className="flex space-x-1 text-thin"
                >
                  <p>{key} - </p>
                  <p>{details[key]}</p>
                </span>
              );
            } else if (cardDetails?.Type !== "invitation reward") {
              return (
                <span
                  key={`subList-${idx}`}
                  className="flex space-x-1 text-thin"
                >
                  <p>{key} - </p>
                  <p>{details[key]}</p>
                </span>
              );
            }
          })}
        </motion.div>
      )}
    </div>
  );
}
