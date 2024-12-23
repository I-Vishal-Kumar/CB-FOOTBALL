import React, { useEffect, useRef, useState } from "react";

let currentOtpIdx = 0;

const OtpInputs = ({ otp, setOtp }) => {
  const [activeIdx, updateActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeIdx]);
  function updateOtp(e) {
    let value = e.target.value;
    let val = value.substring(value.length - 1);
    let newOtp = [...otp];
    newOtp[currentOtpIdx] = val;
    if (!value) updateActiveIdx(currentOtpIdx - 1);
    else updateActiveIdx(currentOtpIdx + 1);
    setOtp(newOtp);
  }

  function handleKeyDown(e, idx) {
    currentOtpIdx = idx;
    if (e.key === "Backspace") {
      updateActiveIdx(currentOtpIdx - 1);
    }
  }
  return (
    <>
      {otp.map((val, idx) => (
        <div key={idx} className="w-10 h-12 ">
          <input
            ref={activeIdx == idx ? inputRef : null}
            className="w-full h-full  text-center outline-none rounded-xl border text-gray-600 border-gray-400 text-[0.9rem] bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
            type="text"
            inputMode="numeric"
            onChange={updateOtp}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            value={otp[idx]}
          />
        </div>
      ))}
    </>
  );
};

export default OtpInputs;
