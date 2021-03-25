import {
  selectDetailedCount,
  selectAllAnimesFilteredSorted,
  selectFilter,
  selectSorting,
  selectAllAnimeMusics,
  filterSet,
  sortingSet,
} from "../features/animes/animesSlice";
import {
  Icon,
  Button,
  Menu,
  List,
  Sidebar,
  Checkbox,
  Sticky,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";

function SideBarControl({ children }) {
  const [visible, setVisible] = useState(false);

  const report = useSelector(selectAllAnimeMusics);

  const animes = useSelector(selectAllAnimesFilteredSorted);
  const detailedCount = useSelector(selectDetailedCount);
  const totalCount = animes.length;
  const filter = useSelector(selectFilter);
  const sorting = useSelector(selectSorting);

  const dispatch = useDispatch();

  useEffect(() => {
    if (animes.length > 0) {
      setVisible(true);
    } else {
      setVisible(false);
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
            ? `Feching... ${detailedCount}/${totalCount}`
            : "Completed"}
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
                onChange={(ev) => dispatch(filterSet({ filter: "all" }))}
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
                onChange={(ev) => dispatch(filterSet({ filter: "watching" }))}
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
                onChange={(ev) => dispatch(filterSet({ filter: "completed" }))}
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
                onChange={(ev) => dispatch(filterSet({ filter: "onhold" }))}
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
                onChange={(ev) => dispatch(filterSet({ filter: "dropped" }))}
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
                onChange={(ev) =>
                  dispatch(filterSet({ filter: "plantowatch" }))
                }
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

      <Sidebar.Pusher>{children}</Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}

export default SideBarControl;
