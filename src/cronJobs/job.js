import cron from "node-cron";
import { sendEmailJob } from "../services/emailService.js";


cron.schedule("*/30 * * * * ", async() => {
    try {
        // await sendEmailJob();
 await sendEmailJob();
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email sending failed:", error);
    }
});

console.log("Cron job started...");

// every 10second
// cron.schedule("*/10 * * * * * ", () => {
//     console.log(
//         "Cron executed:",
//         new Date().toLocaleString("en-IN")
//     );
// });


// ┌──────────── second
// │ ┌────────── minute
// │ │ ┌──────── hour
// │ │ │ ┌────── day of month
// │ │ │ │ ┌──── month
// │ │ │ │ │ ┌── day of week
// │ │ │ │ │ │
// */1 * * * * *


// | Requirement       | Cron expression | Meaning                  |
// | ----------------- | --------------- | ------------------------ |
// | Every 1 minute    | `* * * * *`     | Every minute             |
// | Every 10 minutes  | `*/10 * * * *`  | Every 10 minutes         |
// | Every 15 minutes  | `*/15 * * * *`  | Every 15 minutes         |
// | Every 30 minutes  | `*/30 * * * *`  | Every 30 minutes         |
// | Every 1 hour      | `0 * * * *`     | Every hour               |
// | Every 2 hours     | `0 */2 * * *`   | Every 2 hours            |
// | Every 1 day       | `0 0 * * *`     | Every day at midnight    |
// | Every day at 9 AM | `0 9 * * *`     | Daily at 9 AM            |
// | Every 1 week      | `0 0 * * 0`     | Every Sunday at midnight |
// | Every Monday      | `0 0 * * 1`     | Every Monday at midnight |
// | Every 1 month     | `0 0 1 * *`     | 1st day of every month   |
