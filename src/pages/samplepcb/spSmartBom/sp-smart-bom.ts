import {createApp} from 'vue'
import App from './SpSmartBom.vue'
import {VueCommonParams} from "@/model/vue-common-params";

declare const window: any;

window._spSmartBomapp = {
    bootstrap: (params: Record<keyof VueCommonParams, unknown>) => {
        createApp(App, {params: params}).mount('#spSmartBomApp');
    }
}
