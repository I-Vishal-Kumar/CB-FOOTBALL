/*
  This function deals with creation of matches and sheduling the 
  matches , every night at 12 (midnight)
  #NOTE 
    This function has to be called manually such that cron job can be invoked
    and all set 😁
*/
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import moment from "moment-timezone";
import cron from "node-cron";
import { MATCH } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";
import { getHardcodedMatches } from "@/app/helpers/fetchMatches";
export async function GET(request, res) {
    let test = "not";
    let schedulerStarted = false;

    try {
        // Call the scheduleMatches function immediately
        test = await scheduleMatches();

        // Start the scheduler
        // const task = cron.schedule("0 0 * * *", async () => {
        //     try {
        //         await scheduleMatches();
        //         console.info("Scheduled task executed successfully.");
        //     } catch (error) {
        //         console.error("Error executing scheduled task:", error);
        //     }
        // });

        // // Indicate scheduler has started
        // schedulerStarted = task.options.scheduled;

        // if (schedulerStarted) {
        //     console.info("Scheduler started successfully.");
        // }
        return NextResponse.json(
            {
                status: 200,
                msg: "done",
                data: test,
                scheduler: schedulerStarted,
            },
            {
                headers: {
                    "Cache-Control": "no-store, max-age=0",
                },
                cache: "no-store",
            }
        );
    } catch (error) {
        console.error("Error in GET handler:", error);
        return NextResponse.json({
            status: 500,
            msg: "Internal Server Error",
            error: error.message,
        });
    }
}
export async function scheduleMatches() {
    await connect();
    try {
        console.log("Fetching hardcoded matches for current day");

        // Get hardcoded matches for current day (50 matches distributed across hours)
        const data = getHardcodedMatches(50);

        if (!data || data.length === 0) {
            console.log("No matches found from API");
            return false;
        }

        console.log(`Fetched ${data.length} matches from API`);

        // Store matches in database
        let stringData = JSON.stringify(data);
        let isCreated = await MATCH.findOneAndUpdate(
            { _id: process.env.NEXT_PUBLIC_MATCH_ID },
            { data: stringData }
        );

        return stringData;
        // return isCreated ? true : false;
    } catch (error) {
        console.error("Error in scheduleMatches:", error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return false;
    }
}

function getDate() {
    let nDate = new Date();
    let date = new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "Asia/Calcutta",
    }).format(nDate);
    date = moment.tz(
        date,
        "dddd, MMMM D, YYYY [at] h:mm:ss A [GMT]Z",
        "Asia/Calcutta"
    );
    date = date.toDate();
    return new Date(date);
}
