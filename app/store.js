import { configureStore } from "@reduxjs/toolkit";

// import postsReducer from '../features/posts/postsSlice'
// import usersReducer from '../features/users/usersSlice'
// import notificationsReducer from '../features/notifications/notificationsSlice'
import animesReducer from "../features/animes/animesSlice";

export default configureStore({
  reducer: {
    animes: animesReducer,
    // posts: postsReducer,
    // users: usersReducer,
    // notifications: notificationsReducer,
  },
});
