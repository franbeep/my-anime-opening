import {
  Header,
  Label,
  Card,
  Icon,
  Image,
  List,
  Visibility,
} from "semantic-ui-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectLinkById } from "../../features/links/linksSlice";
import { updateAnimeDetail } from "../../features/animes/animesSlice";

function MusicList({ list, header }) {
  if (list.length == 0)
    return (
      <>
        <Header as="h3" dividing>
          {header}
        </Header>
        <List relaxed>
          <List.Item>
            <List.Icon name="youtube" size="large" verticalAlign="middle" />
            <List.Content>
              <List.Header as={"span"}>
                Searching...
                <i className="spinner loading icon"></i>
              </List.Header>
            </List.Content>
          </List.Item>
        </List>
      </>
    );

  return (
    <>
      <Header as="h3" dividing>
        {header}
      </Header>
      <List relaxed>
        {list.map((item, index) => {
          const link = useSelector((state) =>
            selectLinkById(state, item.whole)
          );

          return (
            <List.Item key={index}>
              <List.Icon name="youtube" size="large" verticalAlign="middle" />
              <List.Content>
                <List.Header
                  as={link !== undefined ? "a" : "span"}
                  href={link || ""}
                  target="_blank"
                >
                  {item.music}
                  {link !== undefined ? (
                    ""
                  ) : (
                    <i className="spinner loading icon"></i>
                  )}
                </List.Header>
              </List.Content>
            </List.Item>
          );
        })}
      </List>
    </>
  );
}

const getTagColor = (status) => {
  switch (status) {
    case "watching":
      return "green";
    case "completed":
      return "blue";
    case "onhold":
      return "orange";
    case "dropped":
      return "red";
    case "plantowatch":
      return "grey";
    default:
      return "black";
  }
};

function AnimeCard({ anime, fetchDetails }) {
  const handleOnScreen = () => {};

  const dispatch = useDispatch();

  useEffect(() => {
    if (!anime.fetched_detail)
      fetchDetails(() => {
        dispatch(updateAnimeDetail(anime.mal_id));
      });
  }, []);

  return (
    <Visibility fireOnMount onOnScreen={handleOnScreen}>
      <Card>
        <Image
          src={anime.image_url} // TODO: preload with placeholder
          wrapped
          ui={false}
        />
        <Label
          color={getTagColor(anime.status)}
          tag
          style={{ position: "absolute", marginLeft: "0px" }}
        >
          {anime.status}
        </Label>
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
            <span>Score: {anime.score || 0}</span>
          </Card.Meta>
          <Card.Description>
            <MusicList list={anime.opening_themes} header={"Openings"} />
            <MusicList list={anime.ending_themes} header={"Endings"} />
          </Card.Description>
        </Card.Content>
      </Card>
    </Visibility>
  );
}

export default AnimeCard;
