import axios from "axios";

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

await getAccessToken();