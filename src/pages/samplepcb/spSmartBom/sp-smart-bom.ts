import {createApp} from 'vue'
import App from './SpSmartBom.vue'
import {SpSmartBomParams} from '@/model/sp-smart-bom-params';

declare const window: any;

const defaultParams: Partial<SpSmartBomParams> = {
    searchServerUrl: 'http://localhost:8081/api/pcbParts/_search',
    mlServerUrl: 'http://localhost:8099/api/analysis',
    cartApiUrl: '/shop/cart_api.php'
};

window._spSmartBomapp = {
    bootstrap: (params: Record<keyof SpSmartBomParams, unknown>) => {
        const mergedParams = { ...defaultParams, ...params };
        createApp(App, {params: mergedParams}).mount('#spSmartBomApp');
    }
}
