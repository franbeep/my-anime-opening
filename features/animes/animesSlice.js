import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import Dropzone from "react-dropzone";
import axios from "axios";
import { sleep } from "../../lib/utils";

const apiPath = "https://api.jikan.moe/v3";

const animesAdapter = createEntityAdapter({
  selectId: (anime) => anime.mal_id,
});

const initialState = animesAdapter.getInitialState({
  user: {},
});

export const fetchUserAnimeInfo = createAsyncThunk(
  "animes/fetchUserAnimeInfo", // TODO: Move to features/user/userSlice
  async (username) => {
    await sleep(1000);
    return await axios
      .get(`${apiPath}/user/${username}`)
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        return null;
      });
  }
);

export const fetchAnimes = createAsyncThunk(
  "animes/fetchAnimes",
  async ({ username, option, page }) => {
    await sleep(1000);
    return await axios
      .get(`${apiPath}/user/${username}/animelist/${option}?page=${page}`)
      .then(({ data }) => {
        return data.anime.map((anime) => ({
          mal_id: anime.mal_id,
          title: anime.title,
          url: anime.url,
          image_url: anime.image_url,
          status: anime.watching_status,
          type: anime.type,
          score: anime.score,
          start_date: anime.start_date,
          end_date: anime.end_date,
          opening_themes: null,
          ending_themes: null,
          fetched_detail: false,
          links: [],
        }));
      })
      .catch((error) => {
        return []; // TODO: Need to work on the errors
      });
  }
);

export const updateAnimeDetail = createAsyncThunk(
  "animes/updateAnimeDetail",
  async (animeId, { getState }) => {
    const anime = selectAnimeById(getState(), animeId);

    return await axios.get(`${apiPath}/anime/${animeId}`).then(({ data }) => {
      return {
        ...anime,
        opening_themes: data.opening_themes.map((item) =>
          item.replaceAll(/#?[0-9]*:/gi, "").replaceAll(/\"/gi, "")
        ),
        ending_themes: data.ending_themes.map((item) =>
          item.replaceAll(/#?[0-9]*:/gi, "").replaceAll(/\"/gi, "")
        ),
        fetched_detail: true,
      };
    });
  }
);

export const printAnimesMusic = createAsyncThunk(
  "animes/fetchUserAnimeInfo",
  async (_, { getState }) => {
    const animes = selectAllAnimesMusics(getState());
    console.log(animes);
    return animes;
  }
);

// TODO: filter by status
// const filtersSlice = createSlice({
//   name: "filters",
//   initialState: [
//     "Currently Watching",
//     "Completed",
//     "On Hold",
//     "Dropped",
//     "Plan to Watch",
//   ],
//   reducers: {}
// });

// TODO: sort by prop
// const sortsSlice = createSlice({
//   name: "sorts",
//   initialState: [
//     "Score",
//     "Season",
//   ],
//   reducers: {}
// });

const animesSlice = createSlice({
  name: "animes",
  initialState,
  reducers: {
    linkAdded(state, action) {
      // TODO: Fix this mess
      const anime = state.entities[action.payload.mal_id];
      state.entities[action.payload.mal_id].links.push(action.payload.link);
    },
  },
  extraReducers: {
    [fetchAnimes.fulfilled]: (state, action) => {
      animesAdapter.addMany(state, action.payload);
    },
    [fetchUserAnimeInfo.fulfilled]: (state, action) => {
      state.user = action.payload;
    },
    [updateAnimeDetail.fulfilled]: (state, action) => {
      state.entities[action.payload.mal_id] = action.payload;
    },
  },
});

export const { linkAdded } = animesSlice.actions;

export const selectUser = (state) => state.animes.user;
export const selectStatus = (state) => state.animes.status;

export default animesSlice.reducer;

export const {
  selectAll: selectAllAnimes,
  selectById: selectAnimeById,
  selectIds: selectAnimeIds,
} = animesAdapter.getSelectors((state) => state.animes);

// const selectSortingProp = (state, props) => props.;
// const selectStatusProp = (state, props) => props;

const selectFilters = (_, props) => props.filters;
const selectSort = (_, props) => props.sort;

// TODO: this function

export const selectSortedAnimesByStatus = createSelector(
  [selectAllAnimes, selectFilters, selectSort],
  (animes, filters, sorts) => {
    return animes
      .sort((a1, a2) => a1[sorts] > a2[sorts])
      .filter((a) => filters.includes(a.status));
  }
);

export const selectAllAnimesLinks = createSelector(
  selectAllAnimes,
  (animes) => {
    return animes.reduce((prev, curr) => {
      return [...prev, ...curr.links];
    }, []);
  }
);

export const selectAllAnimesMusics = createSelector(
  selectAllAnimes,
  (animes) => {
    return animes.reduce((prev, curr) => {
      return [...prev, ...curr.opening_themes, ...curr.ending_themes];
    }, []);
  }
);
