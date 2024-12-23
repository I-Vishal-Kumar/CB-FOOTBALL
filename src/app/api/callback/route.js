import md5 from "md5";

export default async function POST(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST requests are allowed" });
    }

    const merchantKey = "6c567b06cd558af505bbee0271612be0"; // Replace with your test key

    const {
        amount,
        mch_id,
        mch_order_no,
        tradeResult,
        sign,
        version,
    } = req.body;

    // Recreate the sign string for verification
    const signStr = `amount=${amount}&mch_id=${mch_id}&mch_order_no=${mch_order_no}&tradeResult=${tradeResult}&version=${version}`;
    const generatedSign = md5(`${signStr}&key=${merchantKey}`);

    if (generatedSign === sign) {
        console.log("Payment Verified Successfully:", req.body);
        res.status(200).json({ message: "success" });
    } else {
        console.error("Signature validation failed:", req.body);
        res.status(400).json({ message: "Signature error" });
    }
}
