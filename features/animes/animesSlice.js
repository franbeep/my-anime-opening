import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";

import { selectAllLinks } from "../links/linksSlice";

const animesAdapter = createEntityAdapter({
  selectId: (anime) => anime.id,
});

const initialState = animesAdapter.getInitialState({
  filter: ["watching", "completed", "onhold", "dropped", "plantowatch"],
  sorting: {
    value: "title",
    order: "asc",
  },
  error: false,
});

export const fetchAnimes = createAsyncThunk(
  "animes/fetchAnimes",
  async ({ username, take, offset }, {}) => {
    return await axios
      .get("/api/mal/list", {
        params: {
          username,
          take,
          offset,
        },
      })
      .then(({ data }) => data.result)
      .catch(() => {
        throw new Error("Failed fetching anime list");
      });
  }
);

export const updateAnimeDetail = createAsyncThunk(
  "animes/updateAnimeDetail",
  async (animeId, { dispatch, getState }) => {
    const anime = selectAnimeById(getState(), animeId);

    return await axios
      .get("/api/mal/detail", {
        params: {
          id: animeId,
        },
      })
      .then(({ data }) => ({
        ...anime,
        ...data.result,
        fetched_detail: true,
      }))
      .catch(() => {
        dispatch(errorSet("set"));
        throw new Error("Failed fetching anime detail");
      });
  }
);

const animesSlice = createSlice({
  name: "animes",
  initialState,
  reducers: {
    filterSet(state, action) {
      const filter = action.payload.filter;
      if (filter === "all") {
        if (state.filter.length > 0) state.filter = [];
        else
          state.filter = [
            "watching",
            "completed",
            "onhold",
            "dropped",
            "plantowatch",
          ];
        return;
      }
      if (state.filter.includes(filter))
        state.filter = state.filter.filter((item) => item != filter);
      else state.filter.push(filter);
    },
    sortingSet(state, action) {
      const sorting = action.payload.sorting;
      const value = action.payload.value;
      state.sorting[sorting] = value;
    },
    errorSet(state, action) {
      switch (action.payload.type) {
        case "set":
          state.error = true;
        case "clear":
          state.error = false;
        default:
          state.error = true;
      }
    },
  },
  extraReducers: {
    [fetchAnimes.fulfilled]: (state, action) => {
      animesAdapter.addMany(state, action.payload);
    },
    [fetchAnimes.rejected]: (state, action) => {
      //
    },
    [updateAnimeDetail.fulfilled]: (state, action) => {
      state.entities[action.payload.id] = action.payload;
    },
    [updateAnimeDetail.rejected]: (state, action) => {
      state.error = true;
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
export const selectError = (state) => state.animes.error;

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

export const selectDetailedCount = createSelector(
  [selectAllAnimesFilteredSorted],
  (animes) =>
    animes.reduce((acc, anime) => (anime.fetched_detail ? acc + 1 : acc), 0)
);
