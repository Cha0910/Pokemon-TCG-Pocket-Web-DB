import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Pinia 생성
const pinia = createPinia();

// Pinia 등록
app.use(pinia);

// Vue Router 등록
app.use(router);

// 앱 마운트
app.mount("#app");
