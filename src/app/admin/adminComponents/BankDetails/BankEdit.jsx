"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Listeners } from "../Bets/BetCard";
import { useFormState, useFormStatus } from "react-dom";
import { editBank } from "./Action";

const initialState = {
  message: "",
  received: false,
};

export const BankEdit = ({ data }) => {
  const [isDocEditable, toggleEditable] = useState(false);
  const [BankName, updateBankName] = useState("");
  const [AccNumber, updateAccNumber] = useState("");
  const [AccHolderName, updateAccHolderName] = useState("");
  const [Ifsc, updateIfsc] = useState("");
  const [state, formAction] = useFormState(editBank, initialState);
  useEffect(() => {
    if (data) {
      updateAccHolderName(data?.AccHolderName);
      updateAccNumber(data?.AccNumber);
      updateBankName(data?.BankName);
      updateIfsc(data?.Ifsc);
    }
  }, [data]);
  return (
    <form action={formAction}>
      <div
        style={{
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          border: isDocEditable ? "2px dashed skyblue" : "",
        }}
        className="text-sm grid py-2 mt-1 grid-rows-2 px-2 divide-x-2 divide-gray-300 items-center"
      >
        <input
          disabled={!isDocEditable}
          type="text"
          name="BankName"
          onChange={(e) => updateBankName(e.target.value)}
          value={BankName}
          placeholder="293847"
        />
        <input
          disabled={!isDocEditable}
          type="text"
          name="AccNumber"
          onChange={(e) => updateAccNumber(e.target.value)}
          value={AccNumber}
          placeholder="293847"
        />
        <input
          disabled={!isDocEditable}
          type="text"
          name="AccHolderName"
          onChange={(e) => updateAccHolderName(e.target.value)}
          value={AccHolderName}
          placeholder="293847"
        />
        <input
          disabled={!isDocEditable}
          type="text"
          name="Ifsc"
          onChange={(e) => updateIfsc(e.target.value)}
          value={Ifsc}
          placeholder="293847"
        />
      </div>
      <div className="flex space-x-8 justify-center text-sm items-center py-6">
        <button
          onClick={(e) => toggleEditable((prev) => !prev)}
          type="button"
          className="bg-yellow-400 text-white rounded-md px-4 py-0.5"
        >
          Edit
        </button>
        <Button isDisabled={!isDocEditable} />
      </div>
      <Listeners message={state?.message} />
    </form>
  );
};
