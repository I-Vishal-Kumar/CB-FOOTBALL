import React from "react";
import { IoIosArrowBack } from "react-icons/io";

function BetPlaced() {
  return (
    <div className="absolute bottom-0 left-0 w-[100%] h-[80%] bg-white ">
      <div className="grid grid-flow-col  place-items-center">
        <span className="flex place-items-center justify-self-start p-[.5rem]">
          <IoIosArrowBack />
          Back
        </span>
        <div className="flex place-items-center justify-self-start">
          <span
            className="w-[70px] h-[5px]  rounded-2xl  "
            style={{
              background: "#2785f6",
            }}
          ></span>
        </div>
        <span></span>
      </div>

      <div className="h-[40%] w-[90%] mr-auto ml-auto rounded-[20px] bg-[url(../../public/betplace.png)] bg-no-repeat bg-cover bg-center relative  ">
        
        <h1 className="text-center font-semibold text-white py-[1.2rem]  ">
          League Name
        </h1>
        
        <div className=" flex justify-between place-items-center ">
          <div className="w-[40%]  flex flex-col place-items-center ">
            <div className="border-2 h-[60px] w-[60px] rounded-[100%] "></div>
            <p className="text-white " >team name</p>
          </div>

          <div className="flex  flex-col place-items-center " >
            <p className="text-red-600 font-[700] text-[1.2rem] " >23:30</p>
            <p className="text-white font-[500] ">25 FEB</p>
          </div>

          <div className="w-[40%]  flex flex-col place-items-center ">
            <div className="border-2 h-[60px] w-[60px] rounded-[100%] "></div>
            <p className="text-white ">team name</p>
          </div>
        </div>

        <div className="absolute bottom-0 w-[100%] " >
          <h1 className="text-center w-max mr-auto ml-auto px-[.6rem] py-[.2rem]  rounded-t-[.8rem] font-semibold text-white bg-red-300 text-[.9rem] " >Full-Time</h1>
        </div>
      </div>
    </div>
  );
}

export default BetPlaced;
