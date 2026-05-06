const { startFetchDataCron } = require("./fetchDataCron");

function initCronJobs() {
    startFetchDataCron();
    // add more cron jobs here as your app grows
}

module.exports = { initCronJobs };