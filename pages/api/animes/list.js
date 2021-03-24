// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import jikanjs from "jikanjs";

const apiPath = "https://api.jikan.moe/v3";

export default async (req, res) => {
  jikanjs
    .raw([apiPath, "/42897"])
    .then((response) => {
      console.log(response.data);
      res.status(200).json({ data: response.data });
    })
    .catch((err) => {
      console.log(err);
      console.log(err.message);
      res.status(200).json({ message: "Error!" });
    });

  // .then((response) => {
  //   res.status(200).json({ message: "Ok!" });
  // })
  // .catch((err) => {
  //   console.log(err);
  //   console.log(err.message);
  //   res.status(400).json({ message: "Not ok!" });
  // });
};
