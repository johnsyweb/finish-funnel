import { buildLandingPageMarkup } from "./buildLandingPageMarkup";
import "./style.css";

const app = document.querySelector<HTMLElement>("#app");
if (!app) {
  throw new Error("Landing page mount point #app not found");
}

app.innerHTML = buildLandingPageMarkup({
  version: __APP_VERSION__,
  updatedDate: __APP_BUILD_DATE__,
});
