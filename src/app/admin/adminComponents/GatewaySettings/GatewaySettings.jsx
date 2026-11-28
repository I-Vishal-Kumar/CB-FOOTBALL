"use client";
import React, { useState } from "react";
import { useFormState } from "react-dom";
import { updateGatewaySettings } from "./Action";
import { Listeners } from "../Bets/BetCard";

const initialState = { message: "" };

const Toggle = ({ label, name, defaultChecked }) => {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex justify-between items-center py-2 border-b last:border-0">
            <span className="text-sm font-medium capitalize">{label}</span>
            <div className="flex items-center gap-3">
                <span className={`text-xs font-bold ${on ? "text-green-600" : "text-red-500"}`}>
                    {on ? "ON" : "OFF"}
                </span>
                {/* hidden field — always submitted with the current toggle state */}
                <input type="hidden" name={name} value={String(on)} />
                <button
                    type="button"
                    onClick={() => setOn((prev) => !prev)}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                        on ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                    <span
                        className={`block w-5 h-5 mx-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                            on ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};

const GatewaySettings = ({ settings = {} }) => {
    const [state, formAction] = useFormState(updateGatewaySettings, initialState);

    return (
        <form action={formAction} className="px-3 py-2">
            <Toggle
                label="JazPays (Payment link 1)"
                name="JazpaysPayin"
                defaultChecked={settings?.JazpaysPayin !== false}
            />
            <Toggle
                label="WatchPay (Payment link 5)"
                name="WatchpayPayin"
                defaultChecked={settings?.WatchpayPayin !== false}
            />
            <Toggle
                label="AstroPay (Payment link 6)"
                name="AstropayPayin"
                defaultChecked={settings?.AstropayPayin !== false}
            />
            <button
                type="submit"
                className="mt-3 w-full py-1.5 rounded-md bg-blue-600 text-white text-sm font-semibold"
            >
                Save
            </button>
            <Listeners message={state?.message} />
        </form>
    );
};

export default GatewaySettings;
