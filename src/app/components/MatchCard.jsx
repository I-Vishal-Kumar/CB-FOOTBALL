"use client";
import React, { useEffect, useState } from "react";
import HomeGradient from "./HomeGradient";

// extracting the counter such that only counter get updated on every render;

const Countdown = ({ StartsAt }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(StartsAt) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <p>
      start in {`0${timeLeft.hours}`} : {timeLeft.minutes} : {timeLeft.seconds}
    </p>
  );
};

const MemoizedCountdown = React.memo(Countdown);

function MatchCard({ id, data, onClick, color }) {
  const [istTime, setISTTime] = useState("");
  let [percentage, updatePercentage] = useState(0);

  const convertToIST = () => {
    const currentTime = new Date(data.StartsAt); // Get the current time
    const istTime = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    setISTTime(istTime.toLocaleString());
  };

  useEffect(() => {
    let circle_percent = Math.abs(percent(data?.StartsAt || new Date()));
    convertToIST();
    updatePercentage(circle_percent);
  }, []);

  return (
    <div
      onClick={onClick}
      style={{
        boxShadow: "0px 5px 5px 0px rgba(0,0,0,0.1)",
        background: color?.bgColor,
      }}
      className="h-[100px] flex mr-auto ml-auto my-[1rem] w-[90%]  rounded-xl place-items-center justify-around"
    >
      <div className="w-[27%] flex place-items-center h-[90%] justify-center ">
        <div className="h-[100%] aspect-square relative rounded-full bg-[#000000] flex place-items-center justify-center ">
          <div className="h-[90%] flex justify-center items-center text-white ">
            <div style={{ lineHeight: 1 }} className="capitalize text-center">
              <p
                style={{ color: `${color?.stop}` }}
                className={`text-md font-bold`}
              >
                {Math.floor(
                  percentage +
                    Math.min(8, data?.Team_a?.length) +
                    Math.min(7, data?.Team_b?.length) +
                    Math.floor(Number(data?.FixedPercent))
                )}
                M
              </p>
              <p className="text-[0.5rem] ">total </p>
              <p className="text-[0.5rem] ">quantity</p>
            </div>
          </div>
          <div className="absolute flex justify-center items-center h-full w-full">
            <HomeGradient
              id={id}
              percentage={percentage}
              start={color?.start}
              stop={color?.stop}
            />
          </div>
        </div>
      </div>

      <div className=" capitalize  flex flex-col justify-center w-[68%] h-[90%] ">
        <p className="hidden">{data.StakeId}</p>
        <div className="flex  line-clamp-1  font-light text-[#6F6F6F] text-[.6rem] ">
          <span className="flex  ">{istTime}</span>
          <span className="ml-2 line-clamp-1 text-ellipsis w-[50%] ">
            {data?.LeagueName || "no league available"}
          </span>
        </div>

        <div className="flex  line-clamp-1 text-[.7rem] font-normal text-[#6E6E6E] place-items-center ">
          <span className="line-clamp-1 text-ellipsis truncate max-w-xs  ">
            {data?.Team_a || "no team a"}
          </span>
          <span className="mx-1 "> VS </span>
          <span className="line-clamp-1 text-ellipsis  text-center truncate max-w-xs  ">
            {data?.Team_b || "no team a"}
          </span>
        </div>

        <div className="flex line-clamp-1  font-semibold text-[.8rem] place-items-center  ">
          <span>full time , odds</span>
          <span className="flex  line-clamp-1 text-ellipsis place-items-center  ">
            <p className="ml-1">
              {" "}
              {data.Score_a}:{data.Score_b}{" "}
            </p>{" "}
            <p className="ml-1"> @{data.FixedPercent} </p>{" "}
          </span>
        </div>

        <div className="font-light text-[#2885F6] text-[.6rem] ">
          <MemoizedCountdown StartsAt={data?.StartsAt || new Date()} />
        </div>
      </div>
    </div>
  );
}

export default MatchCard;

function percent(startTime) {
  let x = new Date(startTime);
  let time_left = x.getTime() - new Date().getTime();
  let total_time =
    x.getTime() -
    new Date(x.getFullYear(), x.getMonth(), x.getDate(), 10, 0, 0);
  let elapsedPercent = Math.min(
    80,
    ((total_time - time_left) / total_time) * 100
  );
  return elapsedPercent || Math.floor(Math.random() * 70);
}
