"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export const UserContext = React.createContext();

const UserContextProvider = ({ children }) => {
  const [userBalance, setUserBalance] = React.useState(null);
  const [userOtherData, setOtherUserDetails] = React.useState(null);
  const [extraDetails, updateExtraDetails] = React.useState({});
  let router = useRouter();
  useEffect(() => {
    if (
      !window.location.href.includes("admin") &&
      !window.location.href.includes("access") &&
      userBalance === null
    ) {
      getBalance();
    }
  }, []);
  async function getBalance() {
    try {
      let res = await fetch(`/api/user`);
      res = await res.json();
      if (res?.status === 200) {
        setUserBalance(res?.data?.Balance);
        setOtherUserDetails(res?.data?.Other);
      }
      if (res?.status === 302) {
        router.push("/access/login");
      }
    } catch (error) {
      router.push("/access/login");
    }
  }

  async function getExtraDetails() {
    try {
      let res = await fetch(`/api/paymentDetails`);
      res = await res.json();
      if (res?.status === 200) {
        updateExtraDetails(res?.data);
      }
      if (res?.status === 302) {
        router.push("/access/login");
      }
    } catch (error) {
      router.push("/access/login");
    }
  }
  return (
    <UserContext.Provider
      value={{
        userBalance,
        getBalance,
        getExtraDetails,
        extraDetails,
        userOtherData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
