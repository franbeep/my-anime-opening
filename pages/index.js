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

  const [fetchStream, dispatchFetchStream] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "stream/unsubscribe/reset":
          if (state.subscription != null) {
            state.subscription.unsubscribe();
          }
        case "stream/reset":
          const _fetchStream = new Subject();
          const _fetchStreamDelayed = _fetchStream.pipe(
            concatMap((value) => of(value).pipe(delay(500)))
          );
          const subscription = _fetchStreamDelayed.subscribe((f) => {
            f();
          });
          return {
            stream: _fetchStreamDelayed,
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

  const dispatch = useDispatch();

  useEffect(() => {
    dispatchFetchStream({ type: "stream/reset" });
  }, []);

  const handleFetchUsername = async (ev) => {
    setloadingStatus("Fetching User info...");
    await sleep(500);
    if (!typedInput) {
      setloadingStatus("");
      return;
    }

    dispatchIndex({ type: "next" });
    let animesFetched = 0,
      lastFetchedAmount = 0;

    do {
      setloadingStatus(`${animesFetched} Animes loaded...`);
      const data = await dispatch(
        fetchAnimes({
          username: typedInput,
          take: 500,
          offset: animesFetched,
        })
      );
      await sleep(500);

      animesFetched += data.payload.length;
      lastFetchedAmount = data.payload.length;
    } while (lastFetchedAmount);

    setloadingStatus(`${animesFetched} Animes loaded...`);
    await sleep(500);

    setloadingStatus("");
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
        width: "50%",
      }}
    >
      <PaginationWrapper>
        {useSelector(selectAllAnimesFilteredSorted).map((anime) => {
          return (
            <AnimeCard
              key={anime.id}
              anime={anime}
              fetchDetails={async (f) => {
                fetchStream.stream.next(f);
              }}
            />
          );
        })}
      </PaginationWrapper>
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
                dispatch(updateAnimeDetail(anime.id));
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
          {containerList.map((child, index) => {
            return index == actualIndex ? (
              <div className="fadeable" key={index}>
                {child}
              </div>
            ) : (
              ""
            );
          })}
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
