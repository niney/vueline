import {createApp} from 'vue'
import App from './SpSmartBomV2.vue'
import {SpSmartBomV2Params} from '@/model/sp-smart-bom-params';

declare const window: any;

const defaultParams: Partial<SpSmartBomV2Params> = {
    searchServerUrl: 'http://localhost:8081/api/pcbParts/_search',
    mlServerUrl: 'http://localhost:8099/api/analysisWithExcelData',
    cartApiUrl: '/shop/cart_api.php'
};

window._spSmartBomV2app = {
    bootstrap: (params: Record<keyof SpSmartBomV2Params, unknown>) => {
        const mergedParams = { ...defaultParams, ...params };
        createApp(App, {params: mergedParams}).mount('#spSmartBomV2App');
    }
}
