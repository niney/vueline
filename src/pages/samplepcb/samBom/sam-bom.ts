import {createApp} from 'vue'
import App from './SamBom.vue'
import {VueCommonParams} from "@/model/vue-common-params";

declare const window: any;

window._samBomapp = {
    bootstrap: (params: Record<keyof VueCommonParams, unknown>) => {
        createApp(App, {params: params}).mount('#samBomApp');
    }
}
