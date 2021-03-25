import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import axios from "axios";

const apiPath = "/api/ytlink";

const linksAdapater = createEntityAdapter({
  selectId: (link) => link.key,
});
const initialState = linksAdapater.getInitialState();

export const fetchMusicLink = createAsyncThunk(
  "links/fetchMusicLink",
  async (whole) => {
    return await axios
      .get(apiPath, {
        params: {
          music: whole,
        },
      })
      .then((response) => {
        //
        const [first] = response.data.result;
        return {
          key: whole,
          value: `https://www.youtube.com/watch?v=${first.videoId}`,
        };
      })
      .catch((error) => {
        throw new Error("Failed fetching music link");
      });
  }
);

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {},
  extraReducers: {
    [fetchMusicLink.fulfilled]: (state, action) => {
      linksAdapater.addOne(state, action.payload);
    },
  },
});

export default linksSlice.reducer;

export const {
  selectAll: selectAllLinks,
  selectById: selectLinkById,
  selectIds: selectLinkIds,
} = linksAdapater.getSelectors((state) => state.links);

export const selectLinkByIdOrNull = createSelector(selectLinkById, (link) => {
  if (link === undefined) {
    console.log("link is undefined");
  } else {
    console.log("selectLinkByIdOrNull");
    console.log(`link: '${link}'  - length: ${link.length}`);
  }
  return null;
});
