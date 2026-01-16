"use client";

import Image from "next/image";
import MatchCard2 from "../components/MatchCard2";
import PlaceBet from "../components/PlaceBet";
import Layout from "../components/Layout";
import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "../helpers/UserContext";
import Loading from "../components/Loading";

export function Matches() {
    const { userBalance, getBalance } = useContext(UserContext);
    const [isPlaceBet, togglePlaceBet] = useState(false);
    const [placeBetData, updatePlaceBetData] = useState({});
    const [loading, setLoading] = useState(true);

    const [searchKey, updateSearchKey] = useState("");
    const [matches, updateMatches] = useState([]);
    const [matchLoaded, updateLoaded] = useState(false);

    let [slice_length, updateSliceLength] = useState({
        start: 0,
        end: 10,
    });
    let matches_box = useRef();
    let router = useRouter();

    async function getPlaceBet(bool, data) {
        updatePlaceBetData(data);
        togglePlaceBet(bool);
    }

    async function getLiveMatches() {
        try {
            let res = await fetch(`/api/match`);
            if (!res.ok) throw new Error("Error while fetching matches");
            res = await res.json();
            if (res?.status === 200) {
                updateMatches(res?.data?.matches?.splice(0, 5));
            } else {
                throw new Error("Somethign went wrong");
            }
        } catch (error) {
            // router.push("/access/login");
        }
    }

    useEffect(() => {
        if (!userBalance) {
            getBalance();
        }
        if (!matchLoaded) {
            getLiveMatches();
            setLoading(false); // Set loading to false when data is fetched
            updateLoaded(true);
        }
    }, [matchLoaded]);

    useEffect(() => {
        let box = matches_box.current;
        function handleScroll() {
            if (
                box.clientHeight + box.scrollTop >= box.scrollHeight - 10 &&
                matchLoaded === true
            ) {
                let update_len =
                    parseInt(slice_length.end) + 10 > matches.length
                        ? Math.abs(parseInt(matches.length - slice_length.end))
                        : 10;
                updateSliceLength((prev) => {
                    return { ...prev, end: prev.end + update_len };
                });
            }
        }

        box.addEventListener("scroll", handleScroll);
        return () => {
            box.removeEventListener("scroll", handleScroll);
        };
    }, [matches, slice_length]);

    return (
        <Layout>
            <section className="bg-[#f7f8ff] h-[100dvh]">
                {/* {loading && <Loading />} */}
                <div className="relative text-center py-4 h-[8%] ">
                    <h2 className=" capitalize text-[0.65rem] font-bold my-0">
                        matches
                    </h2>
                </div>
                <main className=" space-y-4  h-[92%] ">
                    {/* search box */}
                    {/* <div className="relative px-4 flex-col  h-[15%] max-h-[4rem] flex items-center ">
            <div className="w-full relative">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => updateSearchKey(e.target.value?.toLowerCase())}
                className="text-center px-4 rounded-full py-1.5 outline-none shadow-md
            border-none bg-white w-full"
                placeholder="Search Matches"
              />
              <div className="absolute left-4 top-0 h-full flex justify-center items-center aspect-square ">
                <Image
                  src="/search.png"
                  alt="logo"
                  height={25}
                  width={25}
                ></Image>
              </div>
            </div>
            {searchKey?.length >= 2 && (
              <div className="absolute z-[3] top-[80%] max-h-[900px] bg-slate-100 w-full px-4 py-3 flex flex-col overflow-scroll justify-center">
                {matches?.map((match, idx) => {
                  if (match?.Team_a?.toLowerCase()?.startsWith(searchKey)) {
                    return (
                      <MatchCard2
                        key={`key-${idx}`}
                        placeBet={getPlaceBet}
                        data={{ ...match }}
                      />
                    );
                  }
                })}
              </div>
            )}
          </div> */}
                    <div
                        ref={matches_box}
                        style={{
                            filter:
                                searchKey?.length > 3
                                    ? "blur(0.66px)"
                                    : "blur(0px)",
                        }}
                        className="w-full px-4 overflow-y-scroll pb-[25rem] pt-0 h-[80%] max-h-[80%] space-y-4 "
                    >
                        {matches.length > 2 &&
                            matches
                                .slice(0, slice_length.end || 10)
                                .map((item, i) => (
                                    <MatchCard2
                                        key={item.StakeId}
                                        placeBet={getPlaceBet}
                                        data={{ ...item }}
                                    />
                                ))}

                        {/* {!matchLoaded && matches?.length >= 0 && (
              <div className="text-center w-full text-xl capitalize">
                Loading...
              </div>
            )}
             */}
                    </div>
                    {matchLoaded === true && matches?.length <= 0 && (
                        <div className="h-full w-full flex justify-center items-center">
                            <Loading />
                        </div>
                    )}
                </main>
                {/* popup */}
                {isPlaceBet && (
                    <PlaceBet
                        data={placeBetData}
                        togglePopup={togglePlaceBet}
                    />
                )}
            </section>
        </Layout>
    );
}

// export default Page;
