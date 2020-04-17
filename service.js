const axios = require('axios');
const fs = require('fs');
const image = require('./image')

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

        accessToken = result.data.access_token
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

async function updateViewTitle(videoId, {
    statistics,
    snippet
}) {
    const UPDATE_URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet'
    const {
        description,
        categoryId,
        tags
    } = snippet
    const newTitle = `Video này có ${statistics.viewCount} view! Giới thiệu về sự hay ho của API!`

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

async function updateVideoThumbnail(videoId, view) {
    const thumbnailResult = await image.generateThumbnail(view)
    console.log(thumbnailResult) // generate to output.jpg

    try {
        const THUMBNAIL_URL = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`
        const result = await axios({
            method: 'POST',
            url: THUMBNAIL_URL,
            data: fs.createReadStream(__dirname + '/output.jpg'),
            headers: {
                'Content-Type': 'image/jpeg',
                'Authorization': 'Bearer ' + accessToken
            }
        })

        console.log(`Thumbnail generated successfully. New etag: ${result.data.etag}`)
    } catch (err) {
        console.error(err)
        console.error(err.data)
    }
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

    await updateViewTitle(videoId, {
        statistics,
        snippet
    })
    await updateVideoThumbnail(videoId, statistics.viewCount)
}

module.exports = {
    getAccessToken,
    getVideoDetail,
    updateVideoView
}