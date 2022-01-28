const service = require('./service')
const CronJob = require('cron').CronJob;
require('dotenv').config()


async function main() {
    // Get access token and refresh every 6 hours
    await service.getAccessToken()
    const refreshTokenJob = new CronJob('0 */6 * * *', async () => {
        await service.getAccessToken()
    });
    refreshTokenJob.start()


    // If video view is not updated, quota for every run is only 5
    // Suggestion: Update video every 15 minutes - 110 unit * 4 * 24 = 10560, nearly within daily quota
    // I have 100k quota so can refresh every 2 minutes
    const updateVideoJob = new CronJob('*/2 * * * *', async () => {
        const VIDEO_ID = process.env.VIDEO_ID
        const videoData = await service.getVideoDetail(VIDEO_ID)
        await service.updateVideoView(VIDEO_ID, videoData)
    })
    updateVideoJob.start()

    const heartbeatJob = new CronJob('* * * * *', async () => {
        console.log('Heartbeat every minute. App in running well.')
    }, undefined, true)
    heartbeatJob.start()
}

main()

// // For debugging & testing purposes

// async function test() {
//     await service.getAccessToken()

//     const VIDEO_ID = process.env.VIDEO_ID
//     const videoData = await service.getVideoDetail(VIDEO_ID)
//     await service.updateVideoView(VIDEO_ID, videoData)
// }
// test()
