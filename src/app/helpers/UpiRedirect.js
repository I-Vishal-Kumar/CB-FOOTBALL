export const UpiRedirect = (amount, vpa) => {
    const name = "C.B football";
    const transactionId = Math.floor(Math.random() * 10000000);
    const upiUrl = `upi://pay?pa=${vpa}&pn=${name}&tid=${transactionId}&tr=${transactionId}&am=${amount}&cu=INR`;

    // Open the UPI payment URL in a new tab
    window.open(upiUrl, "_blank");
};
