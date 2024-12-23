import React, { useEffect } from "react";
import gsap from "gsap";

function Loading() {
    useEffect(() => {
        gsap.config({ trialWarn: false });

        let tl = gsap.timeline({
            repeat: -1,
            yoyo: true,
            defaults: { ease: "sine.inOut", duration: 1.2 },
        });
        tl.fromTo("#gradDot", { x: 55 }, { x: -55 })
            .fromTo("#fillDot", { x: -55 }, { x: 55 }, 0)
            .fromTo(
                "#mainGrad",
                { attr: { cx: 230, fx: 230 } },
                { attr: { cx: 570, fx: 570 } },
                0
            );
    }, []);

    return (
        <div className="w-[100%] h-[100%] absolute top-0 left-0 z-[20]">
            <div
                style={{ textAlign: "center" }}
                className="min-h-dvh bg-[#00000018] grid place-items-center"
            >
                <svg
                    id="mainSVG"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 800 600"
                >
                    <defs>
                        <radialGradient
                            id="mainGrad"
                            cx="400"
                            cy="300"
                            fx="400"
                            fy="300"
                            r="60"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset=".68" stopColor="#11468F" />
                            <stop offset=".72" stopColor="#11468F" />
                            <stop offset=".77" stopColor="#11468F" />
                            <stop offset=".82" stopColor="#11468F" />
                            <stop offset=".88" stopColor="#11468F" />
                            <stop offset=".93" stopColor="#11468F" />
                            <stop offset=".99" stopColor="#11468F" />
                            <stop offset="1" stopColor="#f1eefb" />
                        </radialGradient>
                    </defs>
                    <circle
                        id="fillDot"
                        cx="400"
                        cy="300"
                        fill="#11468F"
                        r="60"
                    />
                    <circle
                        id="gradDot"
                        cx="400"
                        cy="300"
                        fill="url(#mainGrad)"
                        r="60"
                    />
                </svg>
            </div>
        </div>
    );
}

export default Loading;
