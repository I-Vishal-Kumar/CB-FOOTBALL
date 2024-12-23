"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Listeners } from "../Bets/BetCard";
import { updateUpi } from "./Action";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
const initialState = {
  message: "",
  isReceived: false,
};
const UpiEdit = ({ data }) => {
  const [isDocEditable, toggleEditable] = useState(false);
  const [demoUpi, updateDemo] = useState([]);
  const [state, formAction] = useFormState(updateUpi, initialState);

  function updateUpiDetails(e, idx) {
    updateDemo((prev) => {
      let newData = [...prev];
      newData[idx] = e.target.value;
      return newData;
    });
  }
  function removeUpi(idx) {
    updateDemo((prev) => {
      let newData = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      return newData;
    });
  }

  useEffect(() => {
    if (data) {
      updateDemo(data || []);
    }
  }, [data]);

  return (
    <form action={formAction} className="bg-white rounded-xl  ">
      <div className="flex flex-wrap gap-2 capitalize  font-bold text-[0.65rem] px-2 py-1.5 text-center">
        {(demoUpi || []).map((ele, idx) => (
          <div className="relative" key={idx}>
            <input
              type="text"
              onChange={(e) => updateUpiDetails(e, idx)}
              disabled={!isDocEditable}
              className="p-1.5 rounded-md shadow-md"
              style={{
                border: isDocEditable
                  ? "2px dotted skyblue"
                  : "1px solid #e4e4e4",
              }}
              placeholder="enter upi"
              value={ele}
              name="upiId"
            />
            {isDocEditable && (
              <p
                onClick={(e) => removeUpi(idx)}
                className="absolute right-0 rounded-r-md top-0 h-full w-6 flex justify-center items-center bg-red-100"
              >
                <Image alt="delete" src={"/wrong.png"} width={12} height={12} />
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-2 text-sm space-x-4 items-center py-1">
        <p
          onClick={(e) => toggleEditable((prev) => !prev)}
          className="px-4 py-0.5 bg-yellow-400 text-white font-bold rounded-md"
        >
          Edit
        </p>
        <p
          onClick={(e) => updateDemo((prev) => [...prev, "new"])}
          className="px-4 py-0.5 bg-green-400 text-white font-bold rounded-md"
        >
          Add new
        </p>

        <Button isDisabled={!isDocEditable} />
      </div>
      <Listeners message={state?.message} />
    </form>
  );
};

export default UpiEdit;
