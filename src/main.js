import Vue from "vue";
import App from "./App.vue";
import router from "./router";
Vue.prototype.$echarts = echarts;

import highcharts from "highcharts";
import "default-passive-events";

import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "@/util/normalize.css";
Vue.use(Element);

let echarts = require("echarts");
Vue.prototype.$echarts = echarts;
// import VueHighCharts from 'vue-highcharts'
import highcharts3d from "highcharts/highcharts-3d";
highcharts3d(highcharts);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
