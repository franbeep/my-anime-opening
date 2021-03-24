// TODO: Better visuals of the card
// TODO: Use split by 'by' instead of regex

import {
  Container,
  Input,
  Button,
  Header,
  Label,
  Grid,
  Dimmer,
  Loader,
  Message,
  Card,
  Icon,
  Image,
  Placeholder,
  Popup,
  List,
  Checkbox,
  Visibility,
} from "semantic-ui-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { linkAdded } from "../../features/animes/animesSlice";

const parseMusicList = (list) => {
  if (list) {
    return list.map((item) => {
      const regexIndex = /#?[0-9]*: /gi; // remove index

      const parsedItem = item.replaceAll(regexIndex, "");
      const [name, author] = parsedItem.split("by");

      return {
        name: name,
        author: author,
        whole: parsedItem,
      };
    });
  }
  return [];
};

const MusicListItem = ({ name, author, whole }) => {
  const [link, setLink] = useState(undefined);

  const dispatch = useDispatch();

  useEffect(() => {
    setLink("#");
    // axios
    //   .get("/api/ytlink", {
    //     params: {
    //       music: whole,
    //     },
    //   })
    //   .then((response) => {
    //     //
    //     const [first] = response.data.result;
    //     const firstLinkURL = `https://www.youtube.com/watch?v=${first.videoId}`;
    //     setLink(firstLinkURL);
    //     // dispatch(linkAdded({ mal_id: anime.mal_id, link: firstLinkURL }));
    //   })
    //   .catch((error) => {
    //     //
    //     console.log(error);
    //     console.log(error.message);
    //   });
  }, []);

  return (
    <List.Item>
      <List.Icon name="youtube" size="large" verticalAlign="middle" />
      <List.Content>
        <List.Header as={link ? "a" : "span"} href={link} target={link}>
          {/* {name.length > 30 ? name.substring(0, 29) + "..." : name} */}
          {name}
          {link ? "" : <i className="spinner loading icon"></i>}
        </List.Header>
      </List.Content>
    </List.Item>
  );
};

const musicDescription = (musicList, header) => {
  return (
    <>
      <Header as="h3" dividing>
        {header}
      </Header>
      {musicList ? (
        <List relaxed>
          {parseMusicList(musicList).map((music, index) => {
            return (
              <MusicListItem
                key={index}
                {...music}
                // name={music.name}
                // author={music.author}
                // whole={music.author}
              />
            );
          })}
        </List>
      ) : (
        <List relaxed>
          <List.Item>
            <List.Icon name="youtube" size="large" verticalAlign="middle" />
            <List.Content>
              <List.Header>
                Searching... <i className="spinner loading icon"></i>
              </List.Header>
              {/* <List.Description as="a">Updated 10 mins ago</List.Description> */}
            </List.Content>
          </List.Item>
        </List>
      )}
    </>
  );
};

const AnimeCard = ({ anime, fetchDetails }) => {
  const handleOnScreen = () => {
    console.log("handleOnScreen");
    if (!anime.fetched_detail) fetchDetails(anime.mal_id);
  };

  return (
    <Visibility fireOnMount onOnScreen={handleOnScreen}>
      <Card>
        <Image
          src={anime.image_url} // TODO: preload with placeholder
          wrapped
          ui={false}
        />
        <Card.Content>
          <Card.Header>
            <Label>
              <a href={anime.url}>
                <Icon name="hashtag" />
                {anime.mal_id}
              </a>
            </Label>{" "}
            <h2>
              {anime.title.length > 35
                ? anime.title.substring(0, 35) + "..."
                : anime.title}
            </h2>
          </Card.Header>
          <Card.Meta>
            {/* <span className="date">Started {anime.start_date || "Unknown"}</span>
          <span className="date">Ended {anime.end_date || "Unknown"}</span> */}
            <span>Score: {anime.score || 0}</span>
          </Card.Meta>
          <Card.Description>
            {musicDescription(anime.opening_themes, "Openings")}
            {musicDescription(anime.ending_themes, "Endings")}
          </Card.Description>
        </Card.Content>
        {/* <Card.Content extra>
        <a>
          <Icon name="user" />
          22 Friends
        </a>
      </Card.Content> */}
      </Card>
    </Visibility>
  );
};

export default AnimeCard;
