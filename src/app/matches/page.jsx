"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import MatchCard2 from "../components/MatchCard2";
import PlaceBet from "../components/PlaceBet";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

export default function MatchesPage() {
    const router = useRouter();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [popupVisible, setPopupVisible] = useState(false);

    async function fetchMatches() {
        try {
            const hourKey = Math.floor(Date.now() / 3600000);
            const res = await fetch(`/api/matches?h=${hourKey}`);
            const data = await res.json();
            if (data?.status === 200) {
                setMatches(data?.data?.matches || []);
            } else if (data?.status === 302) {
                router.push("/access/login");
            }
        } catch (e) {
            router.push("/access/login");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMatches();
        const onFocus = () => fetchMatches();
        document.addEventListener("visibilitychange", onFocus);
        return () => document.removeEventListener("visibilitychange", onFocus);
    }, []);

    const filtered = matches.filter((m) => {
        const q = search.toLowerCase();
        return (
            m?.Team_a?.toLowerCase().includes(q) ||
            m?.Team_b?.toLowerCase().includes(q) ||
            m?.LeagueName?.toLowerCase().includes(q)
        );
    });

    return (
        <Layout>
            <main className="h-screen relative overflow-hidden flex flex-col bg-gradient-to-b from-[#034694] to-[#000000aa]">
                {/* header */}
                <div className="px-4 pt-6 pb-3 flex-shrink-0">
                    <h1 className="text-white font-bold text-lg mb-3">Matches</h1>

                    {/* search bar */}
                    <div className="flex items-center bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 gap-2 border border-white/20">
                        <IoSearchOutline className="text-white/70 text-lg flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search team or league…"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            className="bg-transparent flex-1 text-white placeholder-white/50 text-sm outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch("")}>
                                <IoCloseOutline className="text-white/70 text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* match list */}
                <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-3">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-white/50 text-sm">
                            {search ? "No matches found for your search." : "No upcoming matches."}
                        </div>
                    ) : (
                        filtered.map((item, i) => (
                            <motion.div
                                key={item?.StakeId ?? i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <MatchCard2
                                    data={item}
                                    placeBet={(_, data) => {
                                        setSelectedMatch(data ?? _);
                                        setPopupVisible(true);
                                    }}
                                />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* result count */}
                {!loading && (
                    <div className="absolute top-[6.5rem] right-5 text-white/50 text-xs">
                        {filtered.length} match{filtered.length !== 1 ? "es" : ""}
                    </div>
                )}

                {/* PlaceBet popup */}
                {popupVisible && selectedMatch && (
                    <PlaceBet
                        data={selectedMatch}
                        togglePopup={() => setPopupVisible(false)}
                    />
                )}
            </main>
        </Layout>
    );
}
