// TODO: change everything back to function instead of arrow function

import { useState, useEffect, useReducer, useCallback } from "react";
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
  updateAnimeDetail,
  selectAllAnimeLinks,
  selectAllAnimes,
} from "../features/animes/animesSlice";
import { fetchUserInfo } from "../features/users/usersSlice";
import AnimeCard from "../components/animes/animesCard";
import DragFilesZone from "../components/dragFilesZone";
import SideBarControl from "../components/sideBarControl";
import PaginationWrapper from "../components/paginationWrapper";
import { sleep } from "../lib/utils";

const evalExportFile = (file) => {
  console.log(file);
};

// TODO: Added option to add anime through xml with or divider
function Home() {
  const [loadingStatus, setloadingStatus] = useState("");
  const [typedInput, setTypedInput] = useState("");
  // const [, updateState] = useState();
  // const forceUpdate = useCallback(() => updateState({}), []);

  const [fetchStream, dispatchFetchStream] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "stream/unsubscribe/reset":
          if (state.subscription != null) {
            state.subscription.unsubscribe();
          }
        case "stream/reset":
          const fetchStream = new Subject();
          const fetchStreamDelayed = fetchStream.pipe(
            concatMap((value) => of(value).pipe(delay(500)))
          );
          const subscription = fetchStreamDelayed.subscribe(async (f) => {
            f();
          });
          return {
            stream: fetchStream,
            subscription,
          };
        case "stream/next":
          if (state.stream != null) state.stream.next(action.payload);
      }
      return state;
    },
    {
      stream: null,
      subscription: null,
    }
  );
  const [actualIndex, dispatchIndex] = useReducer((state, action) => {
    if (action.type == "next") {
      return (state += 1);
    }
  }, 0);

  const filteredAnimes = useSelector(selectAllAnimesFilteredSorted);
  const dispatch = useDispatch();

  // const fetchStream = new Subject();
  // const fetchStreamDelayed = fetchStream.pipe(
  //   concatMap((value) => of(value).pipe(delay(1000)))
  // );
  // fetchStreamDelayed.subscribe(async (f) => {
  //   f();
  // });

  useEffect(() => {
    dispatchFetchStream({ type: "stream/reset" });
  }, []);

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
            page: page++,
          })
        );
        await sleep(500);
        animesFetched += data.payload.length;
      }
      setloadingStatus("");
    }
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
        justifyContent: "center",
      }}
    >
      {/* <Grid
        columns={5}
        stackable
        style={{
          margin: "1em",
          marginBottom: "10em",
        }}
      > */}
      <PaginationWrapper>
        {useSelector(selectAllAnimesFilteredSorted).map((anime) => {
          return (
            // <Grid.Column >

            // </Grid.Column>
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              fetchDetails={async (f) => {
                fetchStream.stream.next(f);
              }}
            />
          );
        })}
      </PaginationWrapper>
      {/* </Grid> */}
    </Container>,
  ];

  return (
    <>
      <Head>
        <title>
          My Anime Opening {loadingStatus ? `- ${loadingStatus}` : ""}
        </title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main>
        <SideBarControl
          fetchOne={(anime) => {
            dispatchFetchStream({
              type: "stream/next",
              payload: () => {
                dispatch(updateAnimeDetail(anime.mal_id));
              },
            });
          }}
          fetchReset={() => {
            dispatchFetchStream({ type: "stream/unsubscribe/reset" });
          }}
        >
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
        <Loader indeterminate>{loadingStatus}</Loader>
      </Dimmer>
    </>
  );
}

export default Home;
