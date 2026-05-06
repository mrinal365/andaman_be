const cron = require("node-cron");
const { fetchAndSaveData } = require("../services/cron/fetchDataService");

function startFetchDataCron() {
    cron.schedule("0 * * * *", async () => {
        console.log("Running fetchData cron:", new Date().toISOString());
        try {
            await fetchAndSaveData();
        } catch (err) {
            console.error("Cron job failed:", err);
        }
    });
}

module.exports = { startFetchDataCron };