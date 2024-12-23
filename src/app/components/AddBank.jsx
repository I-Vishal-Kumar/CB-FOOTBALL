import React, { useContext, useState } from "react";
import Image from "next/image";
import { easeInOut, motion } from "framer-motion";
import Input from "./Input";
import { LiaAngleLeftSolid, LiaAngleRightSolid } from "react-icons/lia";
import { AlertContext } from "../helpers/AlertContext";
import { useRouter } from "next/navigation";
const usdtBank = [
  {
    name: "UsdtAddress",
    alt: "usdt address",
    type: "text",
    label: "usdt address (TRC20) ",
  },
  {
    name: "AppName",
    alt: "application name",
    type: "text",
    label: "application name",
  },
];

const localBank = [
  {
    name: "AccHolderName",
    alt: "Account holder",
    type: "text",
    label: "account holder name",
  },
  {
    name: "BankName",
    alt: "bank name",
    type: "text",
    label: "bank name",
  },
  {
    name: "AccNumber",
    alt: "account number",
    type: "number",
    label: "bank account number",
  },
  {
    name: "Ifsc",
    alt: "Ifsc code",
    type: "text",
    label: "bank ifsc",
  },
  {
    name: "BranchName",
    alt: "branch name",
    type: "text",
    label: "bank branch",
  },
  {
    name: "WithdrawCode",
    alt: "Withdrawal code",
    type: "text",
    label: "Withdrawal code",
  },
];

const AddBank = ({ closePopup, localEditable, usdtEditable , isUpdatingBank }) => {
  const { getAlert } = useContext(AlertContext);

  const [localBankCredentials, updateCredentials] = useState({
    AccHolderName: "",
    BankName: "",
    AccNumber: "",
    Ifsc: "",
    BranchName: "",
    WithdrawCode: ''
  });
  const [usdtBankCredentials, updateUsdtBank] = useState({
    UsdtAddress: "",
    AppName: "",
  });
  const [isLocalBank, updateBank] = useState(localEditable);

  async function sendNewBankData() {
    try {
      getAlert();
      let config = {
        method: isUpdatingBank ? "PATCH" : 'POST',
        header: {
          "content-type": "application/json",
        },
        body: JSON.stringify(
          isLocalBank
            ? { ...localBankCredentials, isLocalBank }
            : { ...usdtBankCredentials, isLocalBank }
        ),
      };
      let res = await fetch("/api/profile/account", config);
      res = await res.json();
      if (res?.status === 200) {
        getAlert("success", res?.message || "success");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else if (res?.status === 302) {
        getAlert("redirect", "Login session time out login again.");
      } else {
        getAlert("opps", res?.message || "something went wrong");
      }
    } catch (error) {
      getAlert("redirect", "something went wrong login again");
    }
  }

  function updateUsdt(e) {
    updateUsdtBank((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function update(e) {
    updateCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full absolute top-0 left-0 flex justify-center items-end bg-black/70 w-full"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className=" h-[80%] pt-6 pb-40  bg-slate-50 overflow-y-auto rounded-t-[2rem] w-[98%]"
      >
        <div className="flex  relative px-2  justify-center">
          <h4 className="uppercase w-[20%] h-1 border-2 border-solid border-blue-500 rounded-full"></h4>
          <p
            className="absolute left-2 flex items-center capitalize text-sm font-bold -top-2 p-2"
            onClick={() => closePopup(false)}
          >
            <LiaAngleLeftSolid />
            <span>back</span>
          </p>
        </div>

        <div className="px-6 space-y-3 mt-8 rounded-md  py-2">
          <div className="flex px-3 py-2 shadow-sm  bg-white rounded-md items-center">
            <div className=" mr-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_131_380)">
                  <path
                    d="M4.16665 10.4165V17.7082H7.29165V10.4165H4.16665ZM10.4166 10.4165V17.7082H13.5416V10.4165H10.4166ZM2.08331 22.9165H21.875V19.7915H2.08331V22.9165ZM16.6666 10.4165V17.7082H19.7916V10.4165H16.6666ZM11.9791 1.0415L2.08331 6.24984V8.33317H21.875V6.24984L11.9791 1.0415Z"
                    fill="#000"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_131_380">
                    <rect width="25" height="25" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="flex-[3] capitalize font-semibold text-[0.6rem]">
              {" "}
              local bank transfer
            </div>
            <div className="flex-[1] flex justify-end items-center">
              <input
                type="radio"
                name="Editbank"
                onChange={() => {
                  if (localEditable && usdtEditable) {
                    updateBank((prev) => !prev);
                  } else {
                    updateBank(localEditable);
                  }
                }}
                checked={isLocalBank}
                value={"local"}
                className="size-5"
              />
            </div>
          </div>
      
        </div>
        <div className="mt-2 px-5 capitalize font-extrabold text-sm">
          <p>please fill bank details :-</p>
        </div>
        <div className="px-5 mt-3 space-y-4 ">
          {isLocalBank
            ? localBank.map((ele, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex  items-center justify-between">
                    <label
                      htmlFor="AccountHolderName"
                      className="block text-[0.6rem] capitalize font-semibold p-1 text-black"
                    >
                      {ele.label}
                    </label>
                  </div>
                  <Input
                    credentials={localBankCredentials}
                    inputType={ele.type}
                    id={ele.name}
                    name={ele.name}
                    alt={ele.alt}
                    length={30}
                    image="user.png"
                    update={update}
                  />
                </div>
              ))
            : null
            // usdtBank.map((ele, idx) => (
            //     <div key={idx} className="text-sm">
            //       <div className="flex  items-center justify-between">
            //         <label
            //           htmlFor="AccountHolderName"
            //           className="block text-[0.6rem] capitalize font-semibold p-1 text-black"
            //         >
            //           {ele.label}
            //         </label>
            //       </div>
            //       <Input
            //         credentials={usdtBankCredentials}
            //         inputType={ele.type}
            //         id={ele.name}
            //         name={ele.name}
            //         alt={ele.alt}
            //         length={50}
            //         image="user.png"
            //         update={updateUsdt}
            //       />
            //     </div>
            //   ))
              }
        </div>

        <div className="px-5 mt-8">
          <button
            onClick={sendNewBankData}
            className=" rounded-md text-white font-bold tracking-wider capitalize w-full py-3 bg-blue-600"
          >
            save my bank details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddBank;
