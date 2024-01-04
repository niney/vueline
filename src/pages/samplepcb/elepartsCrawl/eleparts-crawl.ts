import {createApp} from 'vue'
import App from './ElepartsCrawlApp.vue'
import {ElepartsCrawlParams} from "@/model/eleparts-crawl-params";

declare const window: any;

window._elepartsCrawlApp = {
    bootstrap: (params: Record<keyof ElepartsCrawlParams, unknown>) => {
        createApp(App, {params: params}).mount('#elepartsCrawlApp');
    }
}
