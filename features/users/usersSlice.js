import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const apiPath = "https://api.jikan.moe/v3";
const initialState = {};

export const fetchUserInfo = createAsyncThunk(
  "users/fetchUserInfo",
  async (username) => {
    return await axios
      .get(`${apiPath}/user/${username}`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new Error("Failed fetching user info");
      });
  }
);

const usersSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUserInfo.fulfilled]: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const selectUser = (state) => state.user;

export default usersSlice.reducer;
