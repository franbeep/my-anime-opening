import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";

const linksAdapater = createEntityAdapter({
  selectId: (link) => link.key,
  sortComparer: (a, b) => {
    return a.key.localeCompare(b.key);
  },
});
const initialState = linksAdapater.getInitialState({
  error: false,
  linksWithError: {},
});

/**
 * @param {string} str
 * @returns
 */
const cleanWholeUtil = (str) =>
  str.replaceAll(/\(.+?\)/gi, "").replaceAll("  ", " ");

export const fetchYoutubeMusicLink = createAsyncThunk(
  "links/fetchYoutubeMusicLink",
  async (whole, { getState }) => {
    const link = selectLinkById(getState(), cleanWholeUtil(whole).trim());
    const hasError = selectLinksError(getState());
    const isLinkMissing = selectIsLinkMissing(getState(), whole);
    const allMissingLinks = selectAllMissingLinks(getState());

    if (isLinkMissing) {
      console.info(`[404-2] ${whole} was already tried and failed...`);
      return;
    }

    if (hasError) {
      console.info(">> Not found songs:", allMissingLinks);
      return;
    }

    if (!whole) return;

    if (link) return link;

    console.info(`[100] fetching song "${whole}" ...`);

    return await axios
      .get("/api/youtube", {
        params: {
          music: whole,
        },
      })
      .then((response) => {
        const [first] = response.data.result;

        if (!first) {
          console.info(`[404] {first} missing for "${whole}"`);
          return {
            missingKey: whole,
          };
        }
        console.info(`[200] song "${whole}" was found!`);

        return {
          key: whole,
          value: `https://www.youtube.com/watch?v=${first.videoId}`,
          type: "youtube",
        };
      })
      .catch((error) => {
        console.error(error);
        throw new Error("Failed fetching music link");
      });
  }
);

export const fetchSpotifyMusicLink = () => {
  // TODO
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    loadLinksBackup(state, action) {
      linksAdapater.addMany(state, action.payload.links);
    },
    setLinksError(state, action) {
      switch (action.payload.type) {
        case "set":
          state.error = true;
          return;
        case "clear":
          state.error = false;
          return;
        default:
          state.error = true;
          return;
      }
    },
  },
  extraReducers: {
    [fetchYoutubeMusicLink.fulfilled]: (state, action) => {
      if (action.payload?.value) linksAdapater.addOne(state, action.payload);
      if (action.payload)
        state.linksWithError[action.payload.missingKey] = true;
    },
    [fetchYoutubeMusicLink.rejected]: (state) => {
      state.error = true;
    },
  },
});

export const selectLinksError = (state) => state.links.error;

const selectIsLinkMissing = (state, whole) => state.links.linksWithError[whole];

const selectAllMissingLinks = (state) => state.links.linksWithError;

export const { setLinksError, loadLinksBackup } = linksSlice.actions;

export default linksSlice.reducer;

export const {
  selectAll: selectAllLinks,
  selectById: selectLinkById,
  selectIds: selectLinkIds,
} = linksAdapater.getSelectors((state) => state.links);

export const selectAllLinksFiltered = createSelector(
  [selectAllLinks],
  (links) => links
);
