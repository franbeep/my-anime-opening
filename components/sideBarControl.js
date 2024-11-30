import {
  selectDetailedCount,
  selectAllAnimesFilteredSorted,
  selectFilter,
  selectSorting,
  selectAllAnimeMusics,
  selectError,
  filterSet,
  sortingSet,
} from "../features/animes/animesSlice";
import {
  Icon,
  Button,
  Menu,
  Label,
  Grid,
  List,
  Sidebar,
  Checkbox,
  Sticky,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import { Subject, interval } from "rxjs";
import { debounce } from "rxjs/operators";

const changeAnimeStream = new Subject();
const changeAnimeStreamDebounced = changeAnimeStream.pipe(
  debounce(() => interval(500))
);

function SideBarControl({ fetchOne, fetchReset, children }) {
  const [visible, setVisible] = useState(false);

  const report = useSelector(selectAllAnimeMusics);
  const animes = useSelector(selectAllAnimesFilteredSorted);
  const detailedCount = useSelector(selectDetailedCount);
  const totalCount = animes.length;
  const filter = useSelector(selectFilter);
  const sorting = useSelector(selectSorting);
  const fetchingError = useSelector(selectError);

  const dispatch = useDispatch();

  useEffect(() => {
    changeAnimeStreamDebounced.subscribe((animes) => {
      animes
        .filter((anime) => anime.fetched_detail == false)
        .forEach((anime) => {
          fetchOne(anime);
        });
    });
  }, []);

  useEffect(() => {
    fetchReset();
    if (animes.length > 0) {
      setVisible(true);
      changeAnimeStream.next(animes);
    } else {
      changeAnimeStream.next([]);
    }
  }, [animes]);

  return (
    <Sidebar.Pushable style={{ transform: "none" }}>
      <Sidebar
        as={Menu}
        animation="overlay"
        // icon="labeled"
        inverted
        vertical
        visible={visible}
        className={"fixed"}
        style={{ position: "fixed" }}
        // style={{ height: "100vh !important", top: "0" }}
        // width="thin"
      >
        <Menu.Item>
          Status:{" "}
          {detailedCount < totalCount
            ? `Fetching details... ${detailedCount}/${totalCount}`
            : "Completed"}
          {fetchingError && (
            <Button
              color="red"
              size="mini"
              style={{ margin: "0 1em" }}
              onClick={fetchReset}
            >
              Retry
            </Button>
          )}
        </Menu.Item>

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
        <Menu.Item>
          <Button
            basic
            color="red"
            disabled
            onClick={() => {
              //
            }}
          >
            Generate YT Playlist
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Button
            basic
            color="blue"
            onClick={() => {
              var blob = new Blob([JSON.stringify(report)], {
                type: "text/json",
              });
              saveAs(blob, "Music List.json");
            }}
          >
            Generate Basic Report
          </Button>
        </Menu.Item>
      </Sidebar>

      {/* Removed 100vh here */}
      <Sidebar.Pusher>{children}</Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

export default SideBarControl;
