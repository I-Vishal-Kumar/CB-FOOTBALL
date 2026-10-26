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
      // phone screenshots are often several MB; server actions reject bodies over the
      // configured limit, so shrink the QR to a small JPEG before sending it
      compressQr(qrCode)
        .then((base64Data) => {
          qrInput.value = base64Data;
          formRef?.current?.requestSubmit();
        })
        .catch(() => alert("Could not read this image, please choose a PNG or JPG file."));
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

// resizes to at most 800px and re-encodes as JPEG (white background for transparent PNGs);
// resolves with the base64 payload without the "data:...;base64," prefix
function compressQr(file, maxSide = 800) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.92).split(",")[1]);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
}
