import nodemailer from "nodemailer";

export async function sendPhoneOtp(number, otp) {
    try {
        let baseUrl = "https://www.fast2sms.com/dev/bulkV2";
        const querParams = new URLSearchParams({
            authorization:
                "w0d8sQkyt4aIiJ5BcKFfVPxLueZSXoMqATgmUlW1G97Y6NvjzRhBczyNPs9SXtpU6jMurlLqGwavWZJ5",
            variables_values: `${otp}`,
            route: "q",
            numbers: number,
        });
        const headers = {
            "cache-control": "no-cache",
        };
        const url = `${baseUrl}?${querParams.toString()}`;

        let res = await fetch(url, { method: "GET", headers });
        res = await res.json();
        console.log(res);
        if (!res) throw Error("Server error");
        if (res?.return === true) return true;
        return false;
    } catch (error) {
        return false;
    }
}
export async function sendPhoneOtp2(number, otp) {
    try {
        let options = {
            method: "POST",
            headers: {
                authToken:
                    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUUwOEJENjcyMDI2RTQ1MCIsImlhdCI6MTcxNzg2NDExMSwiZXhwIjoxODc1NTQ0MTExfQ.uBxr-KEWfASB-DaQXNKxt6BQXN5bGj7Ng0miTQ2Bf7BL8OzUF5pSJeVHUsP-3rB_dbdModz3zwbgDlQiPV_vvA",
            },
        };

        let url = `https://cpaas.messagecentral.com/verification/v2/verification/send?countryCode=91&customerId=C-E08BD672026E450&senderId=UTOMOB&type=SMS&flowType=SMS&mobileNumber=${number}&message=Your otp for verification is ${otp}`;

        let res = await fetch(url, options);
        res = await res.json();
        console.log(res);
        if (!res) throw Error("Server error");
        if (res?.responseCode === 200) return true;
        return false;
    } catch (error) {
        return false;
    }
}

export async function sendEmailOtp(EmailId, otp) {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "norvellfootball0@gmail.com",
                pass: "gpjukemzttiykwqd",
            },
        });

        let mailOptions = {
            from: "norvellfootball0@gmail.com",
            to: `${EmailId}`,
            subject: "Norvell football",
            text: `Your OTP for varification is ${otp}`,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}
