import {
  Header,
  Label,
  Card,
  Icon,
  Image,
  List,
  Visibility,
} from "semantic-ui-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectLinkById,
  fetchYoutubeMusicLink,
  fetchSpotifyMusicLink,
} from "../../features/links/linksSlice";

function MusicList({ processing, list, header }) {
  const dispatch = useDispatch();

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
                {processing ? (
                  <>
                    Searching...
                    <i className="spinner loading icon"></i>
                  </>
                ) : (
                  <>No songs found</>
                )}
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
              {!link && (
                <>
                  <List.Icon
                    name="spotify"
                    size="large"
                    verticalAlign="middle"
                    onClick={() => {
                      dispatch(fetchSpotifyMusicLink(item.whole));
                    }}
                  />
                  <List.Icon
                    name="youtube"
                    size="large"
                    verticalAlign="middle"
                    onClick={() => {
                      dispatch(fetchYoutubeMusicLink(item.whole));
                    }}
                  />
                </>
              )}
              {link?.type === "youtube" && (
                <List.Icon
                  name="youtube"
                  color="red"
                  size="large"
                  verticalAlign="middle"
                />
              )}
              {link?.type === "spotify" && (
                <List.Icon
                  name="spotify"
                  color="green"
                  size="large"
                  verticalAlign="middle"
                />
              )}

              <List.Content>
                <List.Header
                  as={link ? "a" : "span"}
                  href={link?.value || ""}
                  target="_blank"
                >
                  {item.music}
                  {/* {link !== undefined ? (
                  ""
                ) : (
                  <i className="spinner loading icon"></i>
                )} */}
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

const getStatusTagText = (status) => {
  switch (status) {
    case "watching":
      return "Watching";
    case "completed":
      return "Completed";
    case "onhold":
      return "On Hold";
    case "dropped":
      return "Dropped";
    case "plantowatch":
      return "Plan to Watch";
    default:
      return "N/A";
  }
};

function AnimeCard({ anime }) {
  const handleOnScreen = () => {};

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
          {getStatusTagText(anime.status)}
        </Label>
        <Card.Content>
          <Card.Header>
            <Label>
              <a href={anime.url}>
                <Icon name="hashtag" />
                {anime.id}
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
            <MusicList
              processing={!anime.fetched_detail}
              list={anime.opening_themes}
              header={"Openings"}
            />
            <MusicList
              processing={!anime.fetched_detail}
              list={anime.ending_themes}
              header={"Endings"}
            />
          </Card.Description>
        </Card.Content>
      </Card>
    </Visibility>
  );
}

export default AnimeCard;
