"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Listeners } from "./BetCard";
import { useFormState, useFormStatus } from "react-dom";
import { BlockUnblockUser } from "./Action";
import { useRouter } from "next/navigation";

const initialState = {
  message: "",
  received: false,
};

const BlockUnblockCard = ({ UserName }) => {
  const [userName, updateUserName] = useState("");
  const [blockUnblock, formAction] = useFormState(
    BlockUnblockUser,
    initialState
  );
  let formRef = useRef();
  let blockRef = useRef();
  let router = useRouter();

  useEffect(() => {
    if (blockUnblock?.message) {
      router.refresh();
    }
  }, [blockUnblock, router]);
  useEffect(() => {
    updateUserName(UserName);
  }, [UserName]);

  const initiate_submit = (block) => {
    const blockVal = blockRef?.current;
    if (blockVal && formRef?.current) {
      blockVal.value = block ? "block" : "unblock";
      formRef?.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} action={formAction}>
      <div
        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
        className="text-sm grid py-1 px-2 text-center items-center justify-center"
      >
        <input
          ref={blockRef}
          id="isBlocked"
          type="text"
          className="hidden"
          name="block"
        />
        <input
          className="text-start"
          value={userName}
          onChange={updateUserName}
          type="text"
          name="userName"
          placeholder="userName"
        />
        <p className="bg-red-200 text-red-500 font-bold px-2 py-0.5 rounded-md w-fit justify-self-center">
          blocked
        </p>
        <p
          onClick={(e) => initiate_submit(true)}
          className="bg-blue-300 text-blue-500 font-bold px-2 py-0.5 rounded-md w-fit justify-self-center"
        >
          block
        </p>
        <p
          onClick={(e) => initiate_submit(false)}
          className="bg-blue-300 text-blue-500 font-bold px-2 py-0.5 rounded-md w-fit justify-self-center"
        >
          unblock
        </p>
      </div>
      <Listeners message={blockUnblock?.message} />
    </form>
  );
};
export function BlockNew() {
  const [state, formAction] = useFormState(BlockUnblockUser, initialState);
  let router = useRouter();
  useEffect(() => {
    if (state?.message) {
      router.refresh();
    }
  }, [state, router]);
  return (
    <form action={formAction}>
      <div className="flex px-2 my-2 border-2 border-dashed border-sky-300 py-1.5 text-sm">
        <input
          type="text"
          className="hidden"
          name="block"
          onChange={(e) => {
            console.log("block");
          }}
          value={"block"}
        />
        <input
          type="text"
          placeholder="Enter username to block"
          className="w-[80%]"
          name="userName"
        />
        <Button isDisabled={false} />
      </div>
      <Listeners message={state?.message} />
    </form>
  );
}

export default BlockUnblockCard;
