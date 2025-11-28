import {createApp} from 'vue'
import App from './SpSmartAegisApp.vue'
import {SpSmartAegisParams} from '@/model/sp-smart-aegis-params';

declare const window: any;

const defaultParams: Partial<SpSmartAegisParams> = {
    mlServerUrl: 'http://localhost:8099/api',
    searchServerUrl: 'http://localhost:8081/api'
};

window._spSmartAegisApp = {
    bootstrap: (params: Record<keyof SpSmartAegisParams, unknown>) => {
        const mergedParams = {...defaultParams, ...params};
        createApp(App, {params: mergedParams}).mount('#spSmartAegisApp');
    }
}
