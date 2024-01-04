import {createApp} from 'vue'
import App from './PartnerChat.vue'
import {PartnerChatParams} from "@/model/partner-chat-params";

declare const window: any;

window._partnerChatApp = {
    bootstrap: (params: Record<keyof PartnerChatParams, unknown>) => {
        createApp(App, {params: params}).mount('#partnerChatApp');
    }
}
