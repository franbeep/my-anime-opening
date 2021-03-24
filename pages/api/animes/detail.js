const animeDetailURL = (id, fields) => {
  return `https://api.myanimelist.net/v2/anime/${id}?fields=${fields.join(
    ","
  )}`;
};
