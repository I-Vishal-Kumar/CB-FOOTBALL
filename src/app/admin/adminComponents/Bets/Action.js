"use server";
import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { mongoose } from "mongoose";
import { USER, BET, COMMISSION } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import { revalidatePath } from "next/cache";

// bets per round of bulk writes (settlement is pure in-memory work between writes)
const CHUNK_SIZE = 500;

// function is responsible to settle the unsettled bets placed by the user's

export async function settle(prevState, formData) {
    try {
        let StakeId = formData?.get("StakeId");
        let s_first = formData?.get("score_a_result");
        let s_second = formData?.get("score_b_result");
        let g_first = formData?.get("score_a_own");
        let g_second = formData?.get("score_b_own");
        let membership = formData?.get("membership");

        if (formData.get("stat_1")) {
            let res = await betParser({
                StakeId,
                s_first,
                s_second,
                g_first,
                g_second,
                membership,
            });
            return res;
        } else if (formData.get("stat_2")) {
            let res = await cancelBet({ StakeId });
            return res;
        }
        return {
            message: "select either cancel or success",
        };
    } catch (error) {
        return {
            message: error?.message || error,
        };
    }
}

async function betParser({
    StakeId,
    s_first,
    s_second,
    g_first,
    g_second,
    membership,
}) {
    await connect();
    // Declare state variables in function scope to avoid leaks between concurrent requests
    let update_user = [];
    let update_bet = [];
    let create_commission = [];
    let give_commission = {};
    let session = null;
    let transactionStarted = false;
    try {
        session = await mongoose.startSession();
        await session.startTransaction();
        transactionStarted = true;

        let totalUpdatedUsers = { matchedCount: 0, modifiedCount: 0 };
        let totalUpdatedBets = { matchedCount: 0, modifiedCount: 0 };
        let totalInsertedCommissions = { insertedCount: 0 };
        let totalGivenCommissionCount = {count: 0}
        // S_first , s_second resembles the actual scores of the live match.
        // g_first ,g_second resembles the score given by the admin to the users.

        // let startTime = performance.now();
        if (
            !StakeId ||
            (!s_first && s_first !== 0) ||
            (!s_second && s_second !== 0) ||
            (!g_first && g_first !== 0) ||
            (!g_second && g_second !== 0)
        )
            throw new CustomError(703, "every data is needed", {});

        let unsettledBets = await BET.find({ StakeId, Status: 0 })
            .session(session)
            .lean();

        if (!unsettledBets || unsettledBets?.length < 1)
            throw new CustomError(
                705,
                "No matches exists with StakeId " + StakeId,
                {unsettledBets}
            );

        // whole referral chain (7 levels) for every bettor in 7 queries,
        // instead of up to 7 sequential USER lookups per bet
        const parentOf = await loadReferralParents(
            unsettledBets.map((bet) => bet?.Parent),
            session
        );
        const today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Calcutta",
            })
        );
        const commissionDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

        for (let i = 0; i < unsettledBets.length; i += CHUNK_SIZE) {

            let chunk = unsettledBets.slice(i, i + CHUNK_SIZE);
        //    calculate settled values and store them in arrays.
            for (const bet of chunk) {
                settleOne(bet, {
                    s_first,
                    s_second,
                    g_first,
                    g_second,
                    parentOf,
                    commissionDate,
                    update_user,
                    update_bet,
                    create_commission,
                    give_commission,
                });
            }

            let userResults = await USER.bulkWrite(update_user, { session });
            let betResults = await BET.bulkWrite(update_bet, { session });
            let commissionResults = await COMMISSION.bulkWrite(create_commission, {
                session,
            });
            
            totalUpdatedUsers.matchedCount += userResults.matchedCount;
            totalUpdatedUsers.modifiedCount += userResults.modifiedCount;

            totalUpdatedBets.matchedCount += betResults.matchedCount;
            totalUpdatedBets.modifiedCount += betResults.modifiedCount;

            totalInsertedCommissions.insertedCount += commissionResults.insertedCount;

            let commission_array = [];
            

            if (Object.keys(give_commission).length > 0) {
                for (let user of Object.keys(give_commission)) {
                    commission_array.push({
                        updateOne: {
                            filter: { UserName: user },
                            update: {
                                $inc: {
                                    Profit: Number(give_commission[user]),
                                    Commission: Number(give_commission[user]),
                                },
                            },
                        },
                    });
                }
                let commissionResult = await USER.bulkWrite(commission_array, { session });
                // let commissionToEdision = 0;
                // for(let data of commission_array){
                //     if(data.updateOne.filter.UserName === 'Adison2008'){
                //         commissionToEdision += data.updateOne.update.$inc.Commission;
                //     }
                // }
                // console.log(commissionToEdision);
                // console.log(isUpdated);
                totalGivenCommissionCount.count += commissionResult.modifiedCount
            }

            update_user = [];
            update_bet = [];
            create_commission = [];
            commission_array = [];
            give_commission = {};
        }

        // let endTime = performance.now();
        // console.log("performance", endTime - startTime);
       

        await session.commitTransaction();
        transactionStarted = false;
        return {
            message: `Bet's matched => ${totalUpdatedBets.matchedCount} , Bet's updated => ${totalUpdatedBets.modifiedCount} \n User's Matched => ${totalUpdatedUsers.matchedCount} , User's Updated => ${totalUpdatedUsers.modifiedCount} \n Commission given Count => ${totalInsertedCommissions.insertedCount}`,
        };
    } catch (error) {
        if (transactionStarted && session) {
            try {
                await session.abortTransaction();
            } catch (abortErr) {
                ErrorReport(abortErr);
            }
        }
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return {
            message: error?.message || "something went wrong ",
        };
    } finally {
        if (session) {
            try {
                await session.endSession();
            } catch (endErr) {
                ErrorReport(endErr);
            }
        }
    }
}

/**
 * Loads UserName -> Parent for the referral chain of the given level-1 parents,
 * 7 levels deep, with one query per level. A name missing from the map means that
 * user doesn't exist (the chain stops there, same as before).
 */
async function loadReferralParents(level1Parents, session) {
    const parentOf = new Map();
    let pending = [...new Set(level1Parents.filter(Boolean))];

    for (let level = 1; level <= 7 && pending.length > 0; level++) {
        const users = await USER.find(
            { UserName: { $in: pending } },
            { _id: 0, UserName: 1, Parent: 1 }
        )
            .session(session)
            .lean();
        for (const user of users) {
            if (!parentOf.has(user.UserName))
                parentOf.set(user.UserName, user?.Parent || "");
        }
        pending = [
            ...new Set(
                users.map((user) => user?.Parent).filter((p) => p && !parentOf.has(p))
            ),
        ];
    }
    return parentOf;
}

// Queues the writes that settle one bet: bet result, winner payout and referral commissions
function settleOne(
    match,
    {
        s_first,
        s_second,
        g_first,
        g_second,
        parentOf,
        commissionDate,
        update_user,
        update_bet,
        create_commission,
        give_commission,
    }
) {
    let Profit =
        Number(Number(match?.BetAmount) / 10000) * Number(match?.Percentage);
    Profit -= Profit * 0.05;

    const win =
        Number(match?.Score_a) === Number(g_first) &&
        Number(match?.Score_b) === Number(g_second) &&
        (Number(match?.Score_a) !== Number(s_first) ||
            Number(match?.Score_b) !== Number(s_second));

    if (match?.Parent) {
        give_parent_bonus(
            match?.Parent,
            match?.UserName,
            match?.StakeId,
            Profit,
            Number(match?.BetAmount) / 100,
            win,
            parentOf,
            commissionDate,
            create_commission,
            give_commission
        );
    }

    if (win) {
        let BetAmount = Number(match?.BetAmount) / 100;
        update_user.push({
            updateOne: {
                filter: { UserName: match?.UserName },
                update: {
                    $inc: {
                        ValidAmount: Math.round(Number(match?.BetAmount) * 0.2),
                        Balance: Math.round(BetAmount * 100), // Return bet amount to Balance
                        Profit: Math.round(Profit * 100), // Add profit to Profit field
                    },
                },
            },
        });
    }

    update_bet.push({
        updateOne: {
            // Status: 0 so a bet can never be settled twice
            filter: { _id: match?._id, Status: 0 },
            update: {
                $set: {
                    Result_a: s_first,
                    Result_b: s_second,
                    Remark: win ? "win" : "lose",
                    Status: 1,
                },
            },
        },
    });
}

function give_parent_bonus(
    Parent,
    UserName,
    StakeId,
    Profit,
    BetAmount,
    win,
    parentOf,
    commissionDate,
    create_commission,
    give_commission
) {
    let LEVEL = 1;
    // Commission percentages: L1=7%, L2=3%, L3=2%, L4=1%, L5=1%, L6=1%, L7=1% of user's profit
    let REBADE_PERCENT = [7, 3, 2, 1, 1, 1, 1];

    while (LEVEL <= 7 && Parent) {
        // parent doesn't exist -> chain stops
        if (!parentOf.has(Parent)) break;

        // Calculate commission: Level 1 parent gets 4% of profit, Level 2 gets 2%, Level 3 gets 1%
        // Profit is already in normal units (not * 100), so calculate commission directly
        // If user lost, rebade becomes negative (penalty)
        // Calculate as number and round to avoid precision issues when multiplying by 100 later
        let rebade = win
            ? Math.round((Profit * REBADE_PERCENT[LEVEL - 1] / 100) * 100) / 100
            : Number(BetAmount - BetAmount * 2);

        create_commission.push({
            insertOne: {
                document: {
                    Date: commissionDate,
                    Commission: rebade * 100,
                    From: UserName,
                    StakeId,
                    Level: LEVEL,
                    UserName: Parent,
                    Claimed: false,
                },
            },
        });

        give_commission[Parent] =
            (Number(give_commission[Parent]) || 0) + Math.max(0, rebade * 100);

        // stop on a self-referencing parent, same as before
        const next = parentOf.get(Parent);
        Parent = next && next !== Parent ? next : false;
        LEVEL++;
    }
}

// =================== cancel Bet =================

async function cancelBet({ StakeId }) {
    await connect();
    let betsToCancel = [];
    let updateUsers = [];
    let Session = null;
    let transactionStarted = false;
    try {
        Session = await mongoose.startSession();
        await Session.startTransaction();
        transactionStarted = true;
        
        // only pending bets: cancelling a match after settlement must not refund
        // stakes that were already settled (winners already got their stake back)
        let cancelable_bets = await BET.find({ StakeId, Status: 0 })
            .session(Session)
            .lean();
        for (let bet of cancelable_bets) {
            updateUsers.push({
                updateOne: {
                    filter: { UserName: bet?.UserName },
                    update: {
                        $inc: {
                            Balance: bet?.BetAmount,
                        },
                    },
                },
            });
            betsToCancel.push({
                updateOne: {
                    filter: { _id: bet?._id, Status: 0 },
                    update: {
                        $set: {
                            Status: 2,
                            Remark: "canceled",
                            Result_a: 9,
                            Result_b: 9,
                        },
                    },
                },
            });
        }
        let updatedBets = await BET.bulkWrite(betsToCancel, {
            session: Session,
        });
        let updatedUsers = await USER.bulkWrite(updateUsers, {
            session: Session,
        });
        await Session.commitTransaction();

        revalidatePath("/betsettlement");
        return {
            message: `updated bets ===> ${JSON.stringify(
                updatedBets
            )} and updated users ====> ${JSON.stringify(updatedUsers)}`,
            received: true,
        };
    } catch (error) {
        if (transactionStarted && Session) {
            try {
                await Session.abortTransaction();
            } catch (abortErr) {
                ErrorReport(abortErr);
            }
        }
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return {
            message: JSON.stringify(error),
            received: true,
        };
    } finally {
        if (Session) {
            try {
                await Session.endSession();
            } catch (endErr) {
                ErrorReport(endErr);
            }
        }
    }
}

// ===================== functions to block unblock ==========================
export async function BlockUnblockUser(prevState, formData) {
    try {
        await connect();
        let UserName = formData?.get("userName") || "";
        let toBlock = formData?.get("block") === "block";
        let isUpdated = await USER.findOneAndUpdate(
            { UserName },
            {
                Blocked: toBlock,
            }
        );
        if (!isUpdated)
            throw new Error(`No user with username "${UserName}" found`);
        revalidatePath("/admin/betsettlement");
        return {
            message: toBlock ? "blocked" : "unblocked",
        };
    } catch (error) {
        return {
            message: error?.message || "something went wrong",
        };
    }
}
