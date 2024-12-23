import mongoose from "mongoose";
import { connect } from "../modals/dbConfig";
import { FIXEDDEPOST, USER } from "@/app/modals/modal";

// Helper function to calculate compound interest
const calculateCompoundInterest = (principal, rate, time) => {
    return principal * Math.pow(1 + rate / 100, time);
};

export const settleFixDeposit = async (UserName) => {
    const Session = await mongoose.startSession(); // Start the session
    Session.startTransaction(); // Start the transaction

    try {
        await connect();

        // Find all pending fixed deposits for the user
        const pendingFixedDeposits = await FIXEDDEPOST.find({
            UserName,
            Status: 0, // Only pending deposits
        }).session(Session);

        const now = new Date();

        // Iterate over each pending deposit
        for (const deposit of pendingFixedDeposits) {
            const depositCreatedAt = new Date(deposit.createdAt); // Timestamp of creation
            const depositDurationInDays = Number(deposit.Duration); // Duration in days

            // Calculate the deposit's end time
            const depositEndTime = new Date(
                depositCreatedAt.getTime() +
                    depositDurationInDays * 24 * 60 * 60 * 1000
            );

            // Check if the deposit's end time has passed
            if (now >= depositEndTime) {
                const principal = Number(deposit.Amount || 0) / 100;
                const rate = deposit.Percent;
                const durationInYears = depositDurationInDays / 365; // Convert duration to years

                // Calculate the final amount using compound interest
                const finalAmount = calculateCompoundInterest(
                    principal,
                    rate,
                    durationInYears
                );

                // Settle the deposit by updating its status
                deposit.Status = 1; // Mark as done
                await FIXEDDEPOST.findOneAndUpdate(
                    {
                        UserName,
                        Status: 0,
                        Amount: deposit.Amount,
                        Percent: deposit.Percent,
                    },
                    {
                        $set: {
                            Status: 1,
                        },
                    },
                    { session: Session }
                );
                await USER.findOneAndUpdate(
                    { UserName },
                    {
                        $inc: {
                            Balance: finalAmount,
                        },
                    },
                    { session: Session }
                );
            }
        }

        await Session.commitTransaction();
    } catch (error) {
        console.log(error);
        await Session.abortTransaction();
    } finally {
        Session.endSession();
    }
};
