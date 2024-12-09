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
});

export const fetchYoutubeMusicLink = createAsyncThunk(
  "links/fetchYoutubeMusicLink",
  async (whole, { getState }) => {
    const link = selectLinkById(getState(), whole);
    const hasError = selectLinksError(getState());

    if (!whole || hasError) return;

    if (link) return link;

    return await axios
      .get("/api/youtube", {
        params: {
          music: whole,
        },
      })
      .then((response) => {
        const [first] = response.data.result;
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
      if (action.payload) linksAdapater.addOne(state, action.payload);
    },
    [fetchYoutubeMusicLink.rejected]: (state) => {
      state.error = true;
    },
  },
});

export const selectLinksError = (state) => state.links.error;

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
