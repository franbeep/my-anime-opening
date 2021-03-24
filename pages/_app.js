import "semantic-ui-css/semantic.min.css";
import "../styles/global.css";

import store from "../app/store";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
