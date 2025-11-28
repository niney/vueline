import {createApp} from 'vue'
import App from './SpSmartAegisApp.vue'
import {SpSmartAegisParams} from '@/model/sp-smart-aegis-params';

declare const window: any;

window._spSmartAegisApp = {
    bootstrap: (params: Record<keyof SpSmartAegisParams, unknown>) => {
        createApp(App, {params: params}).mount('#spSmartAegisApp');
    }
}
