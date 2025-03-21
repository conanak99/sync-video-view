import axios from "axios";
import type { YouTubeLiveBroadcastListResponse } from "./types";

async function getAccessToken() {
  const TOKEN_URL = "https://oauth2.googleapis.com/token";
  const { REFRESH_TOKEN, CLIENT_ID, CLIENT_SECRET } = process.env;

  try {
    console.log("Getting access token.");
    const result = await axios({
      method: "POST",
      url: TOKEN_URL,
      data: {
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
    });

    const accessToken = result.data.access_token as string;
    console.log(accessToken);

    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

async function getLiveBroadcasts(accessToken: string) {
  try {
    console.log("Getting live broadcasts.");
    const response = await axios({
      method: "GET",
      url: "https://www.googleapis.com/youtube/v3/liveBroadcasts",
      params: {
        mine: true,
        access_token: accessToken
      }
    });

    const data = response.data as YouTubeLiveBroadcastListResponse;
    console.log(`Found ${data.items.length} broadcasts.`);

    return data.items.map((item) => ({
      liveChatId: item.snippet.liveChatId,
      title: item.snippet.title,
      description: item.snippet.description,
      status: item.status.lifeCycleStatus,
    }));
  } catch (err) {
    console.error("Error fetching live broadcasts:", err);
    return [];
  }
}

const accessToken = await getAccessToken();
if (!accessToken) {
  console.error("Failed to get access token.");
  process.exit(1);
}

const liveBroadcasts = await getLiveBroadcasts(accessToken);
console.log(liveBroadcasts);
