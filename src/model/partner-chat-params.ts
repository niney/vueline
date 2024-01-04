import {VueCommonParams} from "@/model/vue-common-params";

export interface PartnerChatParams extends VueCommonParams {
    partnerOrderId: number;
    itId: string;
    senderId: number;
    receiverId: number
    writeDate: string;
}
