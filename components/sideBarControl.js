import {
  selectDetailedCount,
  selectAllAnimesFilteredSorted,
  selectFilter,
  selectSorting,
  selectAllAnimeMusics,
  filterSet,
  sortingSet,
  updateAnimeDetail,
} from "../features/animes/animesSlice";
import {
  selectAllLinksFiltered,
  fetchYoutubeMusicLink,
  selectLinksError,
  setLinksError,
} from "../features/links/linksSlice";
import { Button, Menu, List, Sidebar, Checkbox } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { saveAs } from "file-saver";
import { Subject, interval } from "rxjs";
import { debounce } from "rxjs/operators";

const changeAnimeStream = new Subject();
const changeAnimeStreamDebounced = changeAnimeStream.pipe(
  debounce(() => interval(500))
);

const linksStream = new Subject();
const linksStreamDebounced = linksStream.pipe(debounce(() => interval(500)));

function SideBarControl({ fetchOne, fetchReset, children }) {
  const [visible, setVisible] = useState(false);
  const [fetchingLinks, setFetchingLinks] = useState(false);

  const report = useSelector(selectAllAnimeMusics);
  const animes = useSelector(selectAllAnimesFilteredSorted);
  const links = useSelector(selectAllLinksFiltered);
  const detailedCount = useSelector(selectDetailedCount);
  const totalCount = animes.length;
  const filter = useSelector(selectFilter);
  const sorting = useSelector(selectSorting);
  const hasLinksError = useSelector(selectLinksError);

  const dispatch = useDispatch();

  const fetchTYLinks = async () => setFetchingLinks(true);

  useEffect(() => {
    if (hasLinksError) {
      dispatch(setLinksError({ type: "clear" }));
      setFetchingLinks(false);
    }
  }, [hasLinksError]);

  useEffect(() => {
    changeAnimeStreamDebounced.subscribe((animes) => {
      animes
        .filter((anime) => anime.fetched_detail == false)
        .forEach((anime) => {
          fetchOne(updateAnimeDetail(anime.id));
        });
    });
  }, []);

  useEffect(() => {
    linksStreamDebounced.subscribe((animes) => {
      animes.forEach((anime) => {
        const themes = [...anime.opening_themes, ...anime.ending_themes];

        themes.forEach((theme) => {
          fetchOne(fetchYoutubeMusicLink(theme.whole));
        });
      });
    });
  }, []);

  useEffect(() => {
    fetchReset();
    if (!fetchingLinks) return;

    if (detailedCount < totalCount || !animes.length) {
      setFetchingLinks(false);
      return;
    }

    linksStream.next(animes);
  }, [fetchingLinks, animes, detailedCount, totalCount]);

  useEffect(() => {
    fetchReset();
    if (animes.length > 0) {
      setVisible(true);
      changeAnimeStream.next(animes);
    } else {
      changeAnimeStream.next([]);
    }
  }, [animes]);

  const statusMessage = useMemo(() => {
    if (detailedCount < totalCount)
      return (
        <>
          {`Fetching details... ${detailedCount}/${totalCount}`}
          <i className="spinner loading icon"></i>
        </>
      );
    if (fetchingLinks)
      return (
        <>
          {"Fetching links..."}
          <i className="spinner loading icon"></i>
        </>
      );
    return "Idle";
  }, [detailedCount, totalCount, fetchingLinks]);

  return (
    <Sidebar.Pushable style={{ transform: "none" }}>
      <Sidebar
        as={Menu}
        animation="overlay"
        inverted
        vertical
        visible={visible}
        className={"fixed"}
        style={{ position: "fixed" }}
      >
        <Menu.Item>Status: {statusMessage}</Menu.Item>

        {detailedCount >= totalCount && (
          <Menu.Item>
            <Button
              disabled={fetchingLinks}
              color="youtube"
              size="mini"
              style={{ margin: "0 1em" }}
              onClick={fetchTYLinks}
            >
              Fetch YT Links
            </Button>
          </Menu.Item>
        )}

        <Menu.Item>
          <label>Filter by:</label>
          <List>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>All</label>
                }
                checked={filter.length == 5}
                indeterminate={filter.length > 0 && filter.length < 5}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "all" }));
                }}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Watching
                  </label>
                }
                checked={filter.includes("watching")}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "watching" }));
                }}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Completed
                  </label>
                }
                checked={filter.includes("completed")}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "completed" }));
                }}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    On Hold
                  </label>
                }
                checked={filter.includes("onhold")}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "onhold" }));
                }}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Dropped
                  </label>
                }
                checked={filter.includes("dropped")}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "dropped" }));
                }}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Plan to Watch
                  </label>
                }
                checked={filter.includes("plantowatch")}
                onChange={(ev) => {
                  fetchReset();
                  dispatch(filterSet({ filter: "plantowatch" }));
                }}
              />
            </List.Item>
          </List>
        </Menu.Item>

        <Menu.Item>
          <label>Sort by:</label>
          <List>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>Title</label>
                }
                radio
                checked={sorting.value == "title"}
                onChange={(ev) =>
                  dispatch(sortingSet({ sorting: "value", value: "title" }))
                }
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>Score</label>
                }
                radio
                checked={sorting.value == "score"}
                onChange={(ev) =>
                  dispatch(sortingSet({ sorting: "value", value: "score" }))
                }
              />
            </List.Item>
          </List>
          <label>Order:</label>
          <List>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Ascending
                  </label>
                }
                radio
                checked={sorting.order == "asc"}
                onChange={(ev) =>
                  dispatch(sortingSet({ sorting: "order", value: "asc" }))
                }
              />
            </List.Item>
            <List.Item>
              <Checkbox
                label={
                  <label style={{ color: "rgba(255,255,255,.9)" }}>
                    Descending
                  </label>
                }
                radio
                checked={sorting.order == "desc"}
                onChange={(ev) =>
                  dispatch(sortingSet({ sorting: "order", value: "desc" }))
                }
              />
            </List.Item>
          </List>
        </Menu.Item>

        {/* buttons */}
        <Menu.Item>
          <Button
            basic
            color="teal"
            onClick={() => {
              var blob = new Blob([JSON.stringify(report)], {
                type: "text/json",
              });
              saveAs(blob, "music_list.json");
            }}
          >
            Generate Music List (plain)
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Button
            basic
            color="teal"
            onClick={() => {
              const backup = {
                animes,
                links,
              };

              var blob = new Blob([JSON.stringify(backup)], {
                type: "text/json",
              });
              saveAs(blob, "backup.json");
            }}
          >
            Generate Backup
          </Button>
        </Menu.Item>
      </Sidebar>

      {/* Removed 100vh here */}
      <Sidebar.Pusher>{children}</Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

export default SideBarControl;
