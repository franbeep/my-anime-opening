// TODO: change everything back to function instead of arrow function

import { useState, useEffect, useReducer } from "react";
import Head from "next/head";
import {
  Container,
  Input,
  Button,
  Header,
  Grid,
  Dimmer,
  Loader,
  Message,
  Segment,
  Divider,
} from "semantic-ui-react";
import GithubCorner from "react-github-corner";
import next from "next"; // TODO: Review NextJS components
import { Subject, of } from "rxjs";
import { concatMap, delay } from "rxjs/operators";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchAnimes,
  selectAllAnimesFilteredSorted,
  selectAllAnimeLinks,
} from "../features/animes/animesSlice";
import { fetchUserInfo } from "../features/users/usersSlice";
import AnimeCard from "../components/animes/animesCard";
import DragFilesZone from "../components/dragFilesZone";
import SideBarControl from "../components/sideBarControl";
import { sleep } from "../lib/utils";

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

  const links = useSelector(selectAllAnimeLinks);
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
  fetchStreamDelayed.subscribe(async (f) => {
    f();
    // dispatchFetchedCount({ type: "increment" });
  });

  const indexReducer = (state, action) => {
    if (action.type == "next") {
      console.log("incremented state to " + (state + 1));
      return (state += 1);
    }
  };
  const [actualIndex, dispatchIndex] = useReducer(indexReducer, 0);

  const evalExportFile = (file) => {
    console.log(file);
  };

  const handleFetchUsername = async (ev) => {
    setloadingStatus("Fetching User info...");
    const { payload: user } = await dispatch(fetchUserInfo(typedInput));
    await sleep(500);
    if (user === null) {
      setloadingStatus("Invalid username, reload the page to try again.");
    } else {
      dispatchIndex({ type: "next" });
      const allAnime =
        user.anime_stats.watching +
        user.anime_stats.completed +
        user.anime_stats.on_hold +
        user.anime_stats.dropped +
        user.anime_stats.plan_to_watch;
      let page = 1,
        animesFetched = 0;
      while (animesFetched < allAnime) {
        setloadingStatus(`${animesFetched}/${allAnime} Animes loaded...`);
        const data = await dispatch(
          fetchAnimes({
            username: typedInput,
            option: "all",
            // option: "completed",
            page: page++,
          })
        );
        await sleep(500);
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
        {useSelector(selectAllAnimesFilteredSorted).map((anime) => {
          return (
            <Grid.Column key={anime.mal_id}>
              <AnimeCard
                anime={anime}
                fetchDetails={async (f) => {
                  fetchStream.next(f);
                }}
              />
            </Grid.Column>
          );
        })}
      </Grid>
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

      <main>
        <SideBarControl>
          <GithubCorner
            size="140"
            href="https://github.com/franbeep/my-anime-opening"
            style={{ zIndex: "100" }}
          />
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
          <div style={{ height: "100vh" }}></div>
        </SideBarControl>
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
