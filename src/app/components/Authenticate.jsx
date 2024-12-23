// pages/authenticate.js or components/Authenticate.js

import { useEffect } from "react";

const Authenticate = ({ callback, phoneNumber = 0 }) => {
    useEffect(() => {
        // Define the listener function
        window.phoneEmailListener = function (userObj) {
            var user_json_url = userObj.user_json_url; // Eg URL: https://user.phone.email/user_abcxd123fgbfg43454.json
            var user_country_code = userObj.user_country_code;
            var user_phone_number = userObj.user_phone_number;
            callback(user_phone_number);
        };

        // Load the external script
        const script = document.createElement("script");
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        document.body.appendChild(script);

        // Clean up the script when component unmounts
        return () => {
            document.body.removeChild(script);
            delete window.phoneEmailListener;
        };
    }, []);

    return (
        <div className="absolute top-0 opacity-0 w-full">
            <div
                className="pe_signin_button"
                data-client-id="17232928839562863277"
            ></div>
        </div>
    );
};

export default Authenticate;
