import axios from "axios";

const apiPath = "https://api.myanimelist.net/v2";

const parseMusic = ({ text: item }) => {
  const parsedItem = item
    .replaceAll(/#?[0-9]*:/gi, "") // remove index
    .replaceAll(/\"/gi, "") // remove quotes}
    .trim();
  const [music, author] = parsedItem.split(" by ");
  return {
    music,
    author,
    whole: parsedItem,
    links: {
      // providers
      spotify: undefined,
      youtube: undefined,
    },
  };
};

export default async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (!req.query.id) {
    res.status(400).json({ message: "missing id param" });
    return;
  }

  const { id } = req.query;

  const fields = ["id", "opening_themes", "ending_themes"];

  try {
    const { data: malData } = await axios.get(
      `${apiPath}/anime/${id}?fields=${fields.join(",")}`,
      { headers: { "X-MAL-CLIENT-ID": process.env.MAL_CLIENT_ID } }
    );

    const mappedMalData = {
      id: malData.id,
      opening_themes: malData.opening_themes?.map(parseMusic) || [],
      ending_themes: malData.ending_themes?.map(parseMusic) || [],
    };

    return res.status(200).json({ result: mappedMalData });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ result: null });
  }
};
