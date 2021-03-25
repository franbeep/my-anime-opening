import { configureStore } from "@reduxjs/toolkit";

import animesReducer from "../features/animes/animesSlice";
import usersReducer from "../features/users/usersSlice";
import linksReducer from "../features/links/linksSlice";

export default configureStore({
  reducer: {
    animes: animesReducer,
    user: usersReducer,
    links: linksReducer,
  },
});
