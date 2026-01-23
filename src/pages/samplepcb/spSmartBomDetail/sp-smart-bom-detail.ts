import {createApp} from 'vue'
import App from './SpSmartBomDetail.vue'
import {SpSmartBomDetailParams} from '@/model/sp-smart-bom-params';

declare const window: any;

const defaultParams: Partial<SpSmartBomDetailParams> = {
    mlServerUrl: 'http://localhost:8099/api',
    searchServerUrl: 'http://localhost:8081/api',
    partId: '5MLUspoB9r-uUU-TCR8r'
};

window._spSmartBomDetailapp = {
    bootstrap: (params: Record<keyof SpSmartBomDetailParams, unknown>) => {
        const mergedParams = { ...defaultParams, ...params };
        createApp(App, {params: mergedParams}).mount('#spSmartBomDetailApp');
    }
}
