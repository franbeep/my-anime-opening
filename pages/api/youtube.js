import axios from "axios";

const apiPath = "https://www.googleapis.com/youtube/v3/search";

export default async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (!req.query.music) {
    res.status(400).json({ message: "missing music param" });
    return;
  }

  axios
    .get(apiPath, {
      params: {
        part: "snippet",
        maxResults: "5",
        key: process.env.YT_API_KEY,
        q: req.query.music,
      },
      headers: {
        Accept: "Accept: application/json",
      },
    })
    .then((response) => {
      const data = response.data.items
        .map((item) => ({
          ...item.id,
        }))
        .filter((item) => item.kind == "youtube#video");
      res.status(200).json({ result: data });
    })
    .catch((error) => {
      console.log(error);
      console.log(error.message);
      res.status(400).json({ result: null });
    });
};
