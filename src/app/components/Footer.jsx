"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState , useEffect } from "react";
import { motion } from "framer-motion";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const variants = {
  open: {
    width: "8.75rem",
    transition: 1,
  },
  closed: { width: "3.625rem", transition: 1 },
  visible: {
    scale: 1,
  },
  hidden: {
    scale: 0,
  },
};

function Footer() {
  return <SecondFooter />;
}

export default Footer;

function SecondFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);

  const [home, setHome] = useState(false);
  const [stake, setStake] = useState(false);
  const [match, setMatch] = useState(false);
  const [profile, setProfile] = useState(false);


  useEffect(() => {
    if (pathname == "/") {
      setHome(true);
    } else {
      setHome(false);
    }

    if (pathname == "/stake") {
      setStake(true);
    } else {
      setStake(false);
    }

    // if (pathname == "/matches") {
    //   setMatch(true);
    // } else {
    //   setMatch(false);
    // }
    if (
      pathname ==="/profile/recharge/paymentChannelThree"||
      pathname ==="/profile/recharge/usdt"||
      pathname ==="/profile/recharge/paymentChannelOne"||
      pathname ==="/profile/recharge/paymentChannelTwo"||
      pathname ==="/profile/help/helps"||
      pathname ==="/profile/help/privacy"||
      pathname == "/profile" ||
      pathname == "/profile/recharge" ||
      pathname == "/profile/commission" ||
      pathname == "/profile/editpassword" ||
      pathname == "/profile/help" ||
      pathname == "/profile/recharge" ||
      pathname == "/profile/withdrawal" ||
      pathname == "/profile/vip"
    ) {
      setProfile(true);
    } else {
      setProfile(false);
    }
  });

  return (
    <div className=" w-full h-[4.25rem] z-[4] absolute bottom-[1.5rem] flex justify-center place-items-center  ">
      <div
        style={{
          boxShadow: "0px 5px 5px 0px rgba(0,0,0,0.15)",
          border: "1px solid lightgray",
        }}
        className="w-[95%] px-2 gap-x-1.5 h-[4rem]   shadow-[0 4px 28% rgba(0, 0, 0, 0.2)]
             backdrop-blur-sm  flex bg-[#c6cacc91]  justify-evenly  rounded-full place-items-center   "
      >
        {/* ---------- home------------- */}
        <motion.div
          variants={variants}
          animate={home ? "open" : "closed"}
          className="bg-[#00000036] h-[3.2rem] w-[3.2rem] rounded-[100px] flex place-items-center justify-center "
        >
          <Link
            href="/"
            className="flex place-items-center  w-full justify-center h-full "
          >
            <Image
              src={home ? "/homeOpen.svg" : "/homeClose.svg"}
              alt="home"
              width={22}
              height={22}
            />
            {home ? <p className="ml-2 text-white ">Home</p> : <p></p>}
          </Link>
        </motion.div>

        {/*------------stake-----------*/}
        <motion.div
          variants={variants}
          animate={stake ? "open" : "closed"}
          className="bg-[#00000036] h-[3.2rem] w-[3.2rem] rounded-full flex place-items-center justify-center "
        >
          <Link
            href="/stake"
            className="flex place-items-center  w-full justify-center h-full "
          >
            <Image
              src={stake ? "/stake.svg" : "/stakeTwo.svg"}
              alt="home"
              width={22}
              height={22}
            />
            {stake ? <p className="ml-2 text-white ">Stake</p> : <p></p>}
          </Link>
        </motion.div>

        {/*------------match-----------*/}
        <motion.div
          variants={variants}
          animate={match ? "open" : "closed"}
          className="bg-[#00000036] h-[3.2rem] w-[3.2rem] rounded-[100%] flex place-items-center justify-center "
        >
          <Link
            href="/matches"
            className="flex place-items-center  w-full justify-center h-full "
          >
            <Image
              // src={match ? "/football.svg" : "/football.svg"}
              src={match ? "/matchOpen.svg" : "/matchClose.svg"}
              alt="matches"
              width={22}
              height={22}
            />
            {match ? <p className="ml-2 text-white ">Match</p> : <p></p>}
          </Link>
        </motion.div>

        {/*------------profile-----------*/}
        <motion.div
          variants={variants}
          animate={profile ? "open" : "closed"}
          className="bg-[#00000036] h-[3.2rem] w-[3.2rem] rounded-[100px] flex place-items-center justify-center "
        >
          <Link
            href="/profile"
            className="flex place-items-center  w-full justify-center h-full "
          >
            <Image
              src={profile ? "/profileTwo.svg" : "/profile.svg"}
              alt="Profile"
              width={22}
              height={22}
            />
            {profile ? <p className="ml-2 text-white ">Profile</p> : <p></p>}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
