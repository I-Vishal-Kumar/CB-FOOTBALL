"use client";
import React, { useRef, useState } from "react";
import { Button, Listeners } from "../Bets/BetCard";
import { updateQr } from "./Action";
import { useFormState, useFormStatus } from "react-dom";
const initialState = {
  message: "",
  isReceived: false,
};
const QrUpdate = () => {
  const [channel, updateChannel] = useState(1);
  const [state, formAction] = useFormState(updateQr, initialState);
  let formRef = useRef();
  let qrFile = useRef();
  let additionalQr = useRef();

  function initiate_submit() {
    let file = qrFile?.current;
    let qrInput = additionalQr?.current;
    if (formRef?.current && file && qrInput) {
      let qrCode = file.files[0];
      if (!qrCode) {
        alert("no file choosen");
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(qrCode);
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1];
        qrInput.value = base64Data;
        formRef?.current?.requestSubmit();
      };
      reader.onerror = (error) => {
        alert("error", error);
      };
    }
  }
  return (
    <form ref={formRef} action={formAction} className="bg-white rounded-xl  ">
      <div
        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
        className="grid capitalize justify-center font-bold text-[0.65rem] px-2 py-1.5 text-center bg-gray-300"
      >
        <input
          type="text"
          name="channel"
          hidden
          value={channel}
          onChange={updateChannel}
        />
        <input type="text" name="qrCode" hidden ref={additionalQr} />
        <div className="flex space-x-2 justify-center">
          <p>Channel 1</p>
          <input
            type="radio"
            checked={channel === 1}
            onChange={(e) => updateChannel(1)}
          />
        </div>
        <div className="flex space-x-2 justify-center">
          <p>Channel 2</p>
          <input
            checked={channel === 2}
            onChange={(e) => updateChannel(2)}
            type="radio"
          />
        </div>
        <div className="flex space-x-2 justify-center">
          <p>Channel 3</p>
          <input
            checked={channel === 3}
            onChange={(e) => updateChannel(3)}
            type="radio"
          />
        </div>
        <div className="flex space-x-2 justify-center">
          <p>Channel 4</p>
          <input
            checked={channel === 4}
            onChange={(e) => updateChannel(4)}
            type="radio"
          />
        </div>
      </div>
      <div className="flex justify-center text-sm space-x-4 items-center py-3">
        <input
          ref={qrFile}
          type="file"
          className="appearance-none bg-blue-400 text-white px-4 py-2 rounded-lg cursor-pointer"
        />
        <p
          onClick={initiate_submit}
          className="bg-red-400 text-white font-bold capitalize px-4 py-2 rounded-md"
        >
          Submit
        </p>
      </div>
      <Listeners message={state?.message} />
    </form>
  );
};

export default QrUpdate;
