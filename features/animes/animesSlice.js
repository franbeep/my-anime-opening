import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";

import { selectAllLinks } from "../links/linksSlice";

const apiPath = "https://api.jikan.moe/v3";

const parseWatchingStatus = (val) => {
  switch (val) {
    case 1:
      return "watching";
    case 2:
      return "completed";
    case 3:
      return "onhold";
    case 4:
      return "dropped";
    case 5:
      return "plantowatch";
    default:
      return "none";
  }
};

const animesAdapter = createEntityAdapter({
  selectId: (anime) => anime.mal_id,
});

const initialState = animesAdapter.getInitialState({
  filter: ["watching", "completed", "onhold", "dropped"], // no "plantowatch"
  sorting: {
    value: "title",
    order: "asc",
  },
  detailed: 0,
});

export const fetchAnimes = createAsyncThunk(
  "animes/fetchAnimes",
  async ({ username, option, page }) => {
    return await axios
      .get(`${apiPath}/user/${username}/animelist/${option}?page=${page}`)
      .then(({ data }) => {
        return data.anime.map((anime) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          url: anime.url,
          image_url: anime.image_url,
          status: parseWatchingStatus(anime.watching_status),
          type: anime.type,
          score: anime.score,
          start_date: anime.start_date,
          end_date: anime.end_date,
          opening_themes: [],
          ending_themes: [],
          fetched_detail: false,
        }));
      })
      .catch((error) => {
        throw new Error("Failed fetching anime list");
      });
  }
);

export const updateAnimeDetail = createAsyncThunk(
  "animes/updateAnimeDetail",
  async (animeId, { getState }) => {
    const anime = selectAnimeById(getState(), animeId);

    const parseMusic = (item, index) => {
      const parsedItem = item
        .replaceAll(/#?[0-9]*:/gi, "") // remove index
        .replaceAll(/\"/gi, "") // remove quotes}
        .trim();
      const [music, author] = parsedItem.split(" by ");
      return {
        music,
        author,
        whole: parsedItem,
      };
    };

    return await axios
      .get(`${apiPath}/anime/${animeId}`)
      .then(({ data }) => {
        return {
          ...anime,
          opening_themes: data.opening_themes.map(parseMusic),
          ending_themes: data.ending_themes.map(parseMusic),
          fetched_detail: true,
        };
      })
      .catch((error) => {
        throw new Error("Failed fetching anime detail");
      });
  }
);

const animesSlice = createSlice({
  name: "animes",
  initialState,
  reducers: {
    filterSet(state, action) {
      // TODO
      // state.animes.filter = action.filter;
    },
    sortingSet(state, action) {
      // TODO
      // state.animes.sorting = action.sorting;
    },
  },
  extraReducers: {
    [fetchAnimes.fulfilled]: (state, action) => {
      animesAdapter.addMany(state, action.payload);
    },
    [updateAnimeDetail.fulfilled]: (state, action) => {
      state.entities[action.payload.mal_id] = action.payload;
      state.detailed += 1;
    },
  },
});

export const { filterSet, sortingSet } = animesSlice.actions;

export default animesSlice.reducer;

export const {
  selectAll: selectAllAnimes,
  selectById: selectAnimeById,
  selectIds: selectAnimeIds,
} = animesAdapter.getSelectors((state) => state.animes);

export const selectFilter = (state) => state.animes.filter;
export const selectSorting = (state) => state.animes.sorting;

export const selectAllAnimesFilteredSorted = createSelector(
  [selectAllAnimes, selectFilter, selectSorting],
  (animes, filter, sorting) =>
    animes
      .filter((item) => filter.includes(item.status))
      .sort((a, b) =>
        sorting.order == "asc"
          ? a[sorting.value] > b[sorting.value]
          : a[sorting.value] < b[sorting.value]
      )
);

export const selectAllAnimeLinks = createSelector(
  [selectAllAnimesFilteredSorted, selectAllLinks],
  (animes, links) =>
    animes
      .map((anime) => {
        // TODO: search each opening/ending with its corresponding link (perhaps do it before this phase)
        return [...anime.opening_themes, ...anime.ending_themes];
      })
      .reduce((acc, links) => {
        return acc.concat(links);
      }, [])
);

export const selectAllAnimeMusics = createSelector(
  [selectAllAnimesFilteredSorted],
  (animes) =>
    animes
      .map((anime) => {
        return [
          ...anime.opening_themes.map((item) => item.whole),
          ...anime.ending_themes.map((item) => item.whole),
        ];
      })
      .reduce((acc, links) => {
        return acc.concat(links);
      }, [])
);

export const selectDetailedCount = (state) => state.animes.detailed;

// const selectFilters = (_, props) => props.filters;
// const selectSort = (_, props) => props.sort;
