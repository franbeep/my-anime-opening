// TODO: change everything back to function instead of arrow function

import { useState, useEffect, useReducer } from "react";
import Head from "next/head";
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
  Checkbox,
  Segment,
  Divider,
} from "semantic-ui-react";
import GithubCorner from "react-github-corner";
import next from "next";
import { sleep } from "../lib/utils";
import { Subject, interval, of, concat } from "rxjs";
import {
  mergeMap,
  map,
  concatMap,
  take,
  distinct,
  delay,
} from "rxjs/operators";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";

import {
  selectAllAnimes,
  fetchUserAnimeInfo,
  fetchAnimes,
  fetchAnimeDetail,
  selectUser,
  updateAnimeDetail,
  selectSortedAnimesByStatus,
  selectAllAnimesLinks,
  selectAllAnimesMusics,
  printAnimesMusic,
} from "../features/animes/animesSlice";

import AnimeCard from "../components/animes/animesCard";
import DragFilesZone from "../components/dragFilesZone";

// TODO: Added option to add anime through xml with or divider

function Home() {
  const [loadingStatus, setloadingStatus] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [fetchedCount, dispatchFetchedCount] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "set/max":
          return { count: 0, max: action.payload.max };
        case "increment":
          return { ...state, count: state.count + 1 };
      }
    },
    { count: -1, max: 0 }
  );

  const dispatch = useDispatch();

  useEffect(async () => {
    if (fetchedCount.count === fetchedCount.max) {
      // await sleep(1000);
      setloadingStatus("");
    }
  }, [fetchedCount]);

  const fetchStream = new Subject();
  const fetchStreamDelayed = fetchStream.pipe(
    concatMap((value) => of(value).pipe(delay(1000)))
  );

  const indexReducer = (state, action) => {
    if (action.type == "next") {
      console.log("incremented state to " + (state + 1));
      return (state += 1);
    }
  };

  const [actualIndex, dispatchIndex] = useReducer(indexReducer, 0);

  fetchStreamDelayed.subscribe(async (id) => {
    dispatch(updateAnimeDetail(id));
    // dispatchFetchedCount({ type: "increment" });
  });

  // console.log("fetching details of anime " + id);
  //                       dispatch(updateAnimeDetail(id));

  const evalExportFile = (file) => {
    console.log(file);
  };

  const handleFetchUsername = async (ev) => {
    setloadingStatus("Fetching User info...");
    const { payload: user } = await dispatch(fetchUserAnimeInfo(typedInput));
    if (user === null) {
      setloadingStatus("Invalid username, try again.");
    } else {
      dispatchIndex({ type: "next" });
      let page = 1,
        animesFetched = 0;
      while (animesFetched < user.anime_stats.completed) {
        setloadingStatus(
          `Hi ${user.username}, ${animesFetched}/${user.anime_stats.completed} animes loaded...`
        );
        const data = await dispatch(
          fetchAnimes({
            username: typedInput,
            option: "completed",
            page: page++,
          })
        );
        animesFetched += data.payload.length;
      }

      // setloadingStatus("Done!");
      setloadingStatus("");

      // dispatchFetchedCount({
      //   type: "set/max",
      //   payload: { max: user.anime_stats.completed },
      // }); // start counting fetches

      // dimmer
      // show new container
    }

    // TODO: add option to filter the "all" accordingly the checkboxes
  };

  const containerList = [
    <Container
      textAlign="center"
      style={{
        minHeight: "100vh",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
      text
    >
      <Header
        as="h1"
        content="My Anime Opening"
        color="pink"
        style={{
          fontSize: "3.5em",
          marginBottom: "1em",
          fontFamily: "'Pacifico', cursive",
          textDecoration: "underline",
        }}
      />
      <Message info style={{ marginBottom: "2em" }} size="large">
        <Message.Header>Welcome!</Message.Header>
        <Message.Content>
          <p>
            Drag your exported <a href="#">MyAnimeList</a> backup here, or Type
            your username below and submit to fetch the list of openings and
            endings of all anime that you have seen.
          </p>
          <p>Make sure your profile anime list is visible to the public.</p>
          <p>Thanks!</p>
        </Message.Content>
      </Message>

      <DragFilesZone callback={evalExportFile} />

      <Divider horizontal>Or</Divider>

      <Input
        // loading={searching}
        disabled={false}
        value={typedInput}
        onChange={(ev) => {
          setTypedInput(ev.target.value);
        }}
        action={{
          color: "blue",
          content: "Fetch List",
          disabled: false,
          size: "large",
          onClick: handleFetchUsername,
        }}
        style={{
          alignSelf: "center",
        }}
        size="large"
        placeholder="MAL username..."
      />
    </Container>,
    <Container
      textAlign="center"
      style={{
        minHeight: "100vh",
        display: "flex",
        // position: "relative",
        justifyContent: "center",
      }}
    >
      <Grid
        columns={5}
        stackable
        style={{
          margin: "1em",
          marginBottom: "10em",
        }}
      >
        {useSelector(selectAllAnimes).map((anime) => {
          return (
            <Grid.Column key={anime.mal_id}>
              <AnimeCard
                anime={anime}
                fetchDetails={async (id) => {
                  fetchStream.next(id);
                }}
              />
            </Grid.Column>
          );
        })}
      </Grid>
      <Segment
        style={{
          position: "fixed",
          alignSelf: "flex-end",
          bottom: "1em",
          width: "100vw",
        }}
      >
        <Button
          color="red"
          disabled
          onClick={(ev) => {
            dispatch(printAnimesMusic());
          }}
        >
          Generate YT Playlist
        </Button>
        <Button
          color="grey"
          onClick={async (ev) => {
            const animes = await dispatch(printAnimesMusic());
            // var blob = new Blob(JSON.stringify(animes), { type: "text/plain;charset=utf-8" });
            var blob = new Blob([JSON.stringify(animes.payload)], {
              type: "application/json",
            });
            saveAs(blob, "animes.json");
          }}
        >
          Report Music List
        </Button>
      </Segment>
    </Container>,
  ];

  return (
    <>
      <Head>
        <title>
          My Anime Opening {loadingStatus ? `- ${loadingStatus}` : ""}
        </title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>
      <GithubCorner
        size="140"
        href="https://github.com/franbeep/my-anime-opening"
        style={{ zIndex: "100" }}
      />
      <main>
        <Container>
          {containerList.map((child, index) => {
            return index == actualIndex ? (
              <div className="fadeable" key={index}>
                {child}
              </div>
            ) : (
              ""
            );
          })}
        </Container>

        {/* dispatchIndex({ type: "next" }); */}
      </main>
      <Dimmer active={Boolean(loadingStatus)}>
        <Loader indeterminate>
          {fetchedCount.count > 0
            ? `Fetching ${fetchedCount.count}/${fetchedCount.max} anime detail...`
            : loadingStatus}
        </Loader>
      </Dimmer>
    </>
  );
}

export default Home;
