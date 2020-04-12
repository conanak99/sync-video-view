const axios = require('axios');
const CronJob = require('cron').CronJob;
require('dotenv').config()

let accessToken = ''

async function getAccessToken() {
    const TOKEN_URL = 'https://oauth2.googleapis.com/token'
    const {
        REFRESH_TOKEN,
        CLIENT_ID,
        CLIENT_SECRET
    } = process.env

    try {
        const result = await axios({
            method: 'POST',
            url: TOKEN_URL,
            data: {
                grant_type: 'refresh_token',
                refresh_token: REFRESH_TOKEN,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            },
        })

        const accessToken = result.data.access_token
        console.log('Get access token', accessToken)

        return accessToken
    } catch (err) {
        console.error(err.data)
    }
}

async function getVideoDetail(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}`
    const result = await axios({
        method: 'GET',
        url,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })

    const videoData = result.data.items[0]
    const {
        statistics,
        snippet
    } = videoData

    return {
        statistics,
        snippet
    }
}

function isViewUpdated({
    statistics,
    snippet
}) {
    const currentView = statistics.viewCount

    let titleView = '0'
    const titleViewMatch = snippet.title.match(/\d+/)
    if (titleViewMatch && titleViewMatch.length === 1) {
        titleView = titleViewMatch[0]
    }

    console.log({
        currentView,
        titleView
    })
    return currentView !== titleView
}

async function updateVideoView(videoId, {
    statistics,
    snippet
}) {
    if (!isViewUpdated({
            statistics,
            snippet
        })) {
        console.log('Video view is updated. Do not update!')
        return
    }

    const UPDATE_URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet'
    const {
        description,
        categoryId,
        tags
    } = snippet
    const newTitle = `Video này có ${statistics.viewCount} view. Xoá mù về API trong 15 phút!`

    try {
        const result = await axios({
            method: 'PUT',
            url: UPDATE_URL,
            data: {
                id: videoId,
                snippet: {
                    title: newTitle,
                    description,
                    categoryId,
                    tags
                }
            },
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })

        console.log(`Video updated successfully. New title ${result.data.snippet.title}.`)
    } catch (err) {
        console.error(err)
        console.error(err.data)
    }
}

async function main() {
    accessToken = await getAccessToken()

    // Refresh every 30 minutes
    const refreshTokenJob = new CronJob('*/30 * * * *', async () => {
        accessToken = await getAccessToken()
    });
    refreshTokenJob.start()


    // Update video every 10 minutes
    // 60 unit * 6 * 24 = 8640, within daily quota
    const updateVideoJob = new CronJob('*/10 * * * *', async () => {
        const VIDEO_ID = process.env.VIDEO_ID
        const videoData = await getVideoDetail(VIDEO_ID)
        await updateVideoView(VIDEO_ID, videoData)
    })
    updateVideoJob.start()

    const heartbeatJob = new CronJob('* * * * *', async () => {
        console.log('Heartbeat. App in running well.')
    }, undefined, true)
    heartbeatJob.start()
}

main()