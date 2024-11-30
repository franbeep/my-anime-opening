import axios from "axios";

const apiPath = "https://api.myanimelist.net/v2";

const parseWatchingStatus = (val) => {
  if (["watching", "completed", "dropped"].includes(val)) return val;

  if (val === "on_hold") return "onhold";

  if (val === "plan_to_watch") return "plantowatch";

  return "N/A";
};

export default async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (!req.query.username) {
    res.status(400).json({ message: "missing username param" });
    return;
  }

  if (!req.query.take) {
    res.status(400).json({ message: "missing take param" });
    return;
  }

  if (!req.query.offset) {
    res.status(400).json({ message: "missing offset param" });
    return;
  }

  const { username, take, offset } = req.query;

  const fields = [
    "id",
    "title",
    "main_picture",
    "status",
    "media_type",
    "score",
    "start_date",
    "end_date",
    "list_status",
  ];

  try {
    const { data: malData } = await axios.get(
      `${apiPath}/users/${username}/animelist?fields=${fields.join(
        ","
      )}&limit=${take}&offset=${offset}`,
      { headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID } }
    );

    const mappedMalData = malData.data.map(
      ({ node: anime, list_status: list }) => ({
        id: anime.id,
        title: anime.title,
        url: `https://myanimelist.net/anime/${anime.id}/`,
        image_url:
          anime.main_picture.large ||
          anime.main_picture.medium ||
          anime.main_picture.small,
        status: parseWatchingStatus(list?.status),
        type: anime.media_type,
        score: anime.score,
        start_date: anime.start_date,
        end_date: anime.end_date,
        opening_themes: [],
        ending_themes: [],
        fetched_detail: false,
      })
    );

    return res.status(200).json({ result: mappedMalData });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ result: null });
  }
};
