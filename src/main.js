import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

import Index from "./Index.vue";
import "./assets/fonts/fonts.css";

import store from "./store";

import TIM from "tim-js-sdk";
import TIMUploadPlugin from "tim-upload-plugin";

let options = {
  SDKAppID: 1400547582,
};
let tim = TIM.create(options);
tim.setLogLevel(0);
tim.registerPlugin({ "tim-upload-plugin": TIMUploadPlugin });
window.tim = tim;
window.TIM = TIM;
window.options = options;

const app = createApp(Index);
app.use(ElementPlus);
app.use(store);
app.mount("#app");
