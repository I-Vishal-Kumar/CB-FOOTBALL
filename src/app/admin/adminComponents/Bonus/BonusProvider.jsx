"use client";
import React, { useState } from "react";
import { Button, Listeners } from "../Bets/BetCard";
import { useFormState } from "react-dom";
import { giveReward } from "./Action";

const initialState = {
  message: "",
  received: false,
};
const BonusProvider = () => {
  const [isDocEditable, toggleEditable] = useState(false);
  const [state, formAction] = useFormState(giveReward, initialState);

  return (
    <form action={formAction}>
      <div
        style={{
          border: isDocEditable ? "2px dashed skyblue" : "",
        }}
        className="text-sm py-2 mt-1 px-2 space-y-1 divide-gray-300 items-center"
      >
        <p className="font-bold">Enter userId:</p>
        <input
          disabled={!isDocEditable}
          type="text"
          name="UserName"
          className="text-[0.9rem]"
          placeholder="user"
        />
        <p className="font-bold">Enter amount:</p>
        <input
          disabled={!isDocEditable}
          type="text"
          className="text-[0.9rem]"
          name="Amount"
          placeholder="293847"
        />
        <p className="font-bold">Enter remark:</p>
        <input
          disabled={!isDocEditable}
          type="text"
          name="Remark"
          className="text-[0.9rem]"
          placeholder="hello"
        />
      </div>
      <div className="flex space-x-8 justify-center text-sm items-center py-6">
        <button
          onClick={(e) => toggleEditable((prev) => !prev)}
          type="button"
          className="bg-yellow-300 text-white rounded-md px-4 py-0.5"
        >
          Edit
        </button>
        <Button isDisabled={!isDocEditable} />
      </div>
      <Listeners message={state?.message} />
    </form>
  );
};

export default BonusProvider;
