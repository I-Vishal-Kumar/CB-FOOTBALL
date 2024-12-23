import React from "react";
import Image from "next/image";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { FaStar } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";

function Vip({ data, isActive }) {
  return (
    <div
      style={{ boxShadow: "0 5px 5px rgb(0,0,0,0.05)" }}
      className="bg-[white] h-max pb-3 mb-[1rem] mt-2 rounded-[30px] w-[90%] mr-auto ml-auto "
    >
      <div
        style={{
          backgroundImage: `url(${data.imagesrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="h-[6rem]  rounded-t-[30px]  flex  place-items-center "
      >
        <div className=" h-[4rem] w-[4rem] ml-[8%] " >
            <img src={data.diamondSrc} className="object-contain w-full h-full  grid place-items-center " />
        </div>
        <span className="ml-[.5rem] ">
          <h1 style={{color:data.color}} className="text-[1rem] font-semibold -tracking-tight  ">
            {data.tittle}
          </h1>
          <span style={{color:data.textColor}} className="text-xs flex place-items-center font-medium ">
            Exclusive for users
            {isActive && (
              <>
                <p className="text-white ml-1 ">activated</p>
                <IoMdCheckmarkCircle className="ml-1 text-[#00DB58] " />
              </>
            )}
          </span>
        </span>
        
      </div>

      <p className="text-center text-[.65rem] font-semibold mt-1 text-s  ">
        Member Exclusive Benefits
      </p>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">Extra Match Plan</p>
            <p className="text-xs font-light "> {data.matchplan} </p>
          </span>
        </div>
        <div className="mr-4 ">{data.icons[0]}</div>
      </div>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">Swift Withdrawal Service</p>
            <p className="text-xs font-light ">
              Exclusive For Diamond and B Diamond Members
            </p>
          </span>
        </div>
        <div className="mr-4 ">{data.icons[1]}</div>
      </div>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">
              prompt Customer Support Response
            </p>
            <p className="text-xs font-light ">Free Add-on</p>
          </span>
        </div>
        <div className="mr-4">{data.icons[2]}</div>
      </div>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">Wide Range Of Withdrawal</p>
            <p className="text-xs font-light "> {data.wideRange} </p>
          </span>
        </div>
        <div className="mr-4">{data.icons[3]}</div>
      </div>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">Hassle Free Withdrawal</p>
            <p className="text-xs font-light ">Free Add-on</p>
          </span>
        </div>
        <div className="mr-4">{data.icons[4]}</div>
      </div>

      <div className=" mt-4 flex justify-between place-items-center ">
        <div className="flex  place-items-center ml-4 ">
          <FaStar className="text-[1.4rem]  text-[#FCD635] " />
          <span className="ml-2  ">
            <p className="text-sm font-[500] ">
              To Attain Emerald membership status
            </p>
            <p className="text-xs font-light ">{data.depositRange}</p>
          </span>
        </div>
        <div className="mr-4">{data.icons[5]}</div>
      </div>

      <div className="w-[70px] h-[5px] mt-[1rem]  mr-auto ml-auto rounded-2xl bg-blue-500 "></div>
    </div>
  );
}

export default Vip;
