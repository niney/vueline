<template>
    <div class="chat-box">
<!--        <h5>주문자 : {{item.odName}} / 파일명 : {{getFilenameByPath(item.file)}}</h5>-->
        <div class="chat" id="chat">
            <template v-bind:key="index" v-for="(chat, index) in chatList">
            <div :class="{ me: parseInt(chat.senderId) === params.senderId, you: parseInt(chat.senderId) === params.receiverId }">
                <span class="chat-bubble">{{ chat.contents }}</span>
                <div class="fi" v-if="chat.fileId">
                    <a target="_self" :href="fileServerUrl() + '/api/download/' + chat.pathToken">{{ chat.originFileName }}</a>
                </div>
                <div class="dt">{{ chat.writeDate }}</div>
            </div>
            </template>
        </div>
        <form id="form" name="chatForm" ref="chatForm" class="chat-form" enctype="multipart/form-data" onsubmit="return false;">
            <div class="send-box">
                <textarea id="message" name="message" v-model="message" rows="3" cols="50" @keydown.enter="sendMessage"></textarea><br><br>
                <button type="submit" class="btn btn-primary send" @click="sendMessage()">SEND</button>
            </div>
            <div @drop="dropUpload($event);">
                <input type='file' name='file' id='file'>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import {defineComponent, nextTick} from 'vue';
import {FILE_SERVER_URL, SAMPLEPCB_URL} from "@/app-constants";
import {io, Socket} from "socket.io-client";
import {PartnerChatParams} from "@/model/partner-chat-params";
let socket: Socket;

export default defineComponent({
    name: 'PartnerChatApp',
    props: {
        params: {
            type: Object as () => PartnerChatParams,
            required: true
        }
    },
    data() {
        return {
            item: {} as any,
            chatList: [] as any[],
            message: ''
        }
    },
    created() {
        socket = io("https://socket.samplepcb.kr/", {
            path: '/partner',
            autoConnect: true,
            reconnection: true,
            query: {id: this.params.senderId}
        // }).on('connect', (/*...args*/) => {
        }).on("onMessage", async (...args) => {
            let chat = args[0].data;
            this.chatList.push(chat);
            this.chatEndScroll();
            if (window.opener) {
                window.opener.location.reload();
            }
        });
        this.readChat();
        this.readItem();
    },
    methods: {
        fileServerUrl() {
            return FILE_SERVER_URL
        },
        async readChat() {
            const response = await $.get(SAMPLEPCB_URL + '/adm/shop_admin/partner_chat_api.php?' + $.param({
                w: 'rl',
                partnerOrderId: this.params.partnerOrderId,
                itId: this.params.itId,
                senderId: this.params.senderId,
                receiverId: this.params.receiverId,
                writeDate: this.params.writeDate
            }));
            if (response.result) {
                this.chatList = response.data;
                this.checkEndScroll();
            }
        },
        // read item
        async readItem() {
            const response = await $.get(SAMPLEPCB_URL + '/adm/shop_admin/partnerorder_api.php?w=ro&itId=' + this.params.itId);
            if (response.result) {
                this.item = response.data;
            }
        },
        async sendMessage(event: any = undefined) {
            if (event && (event.ctrlKey || event.shiftKey)) {
                return;
            }
            if (!this.message) {
                return;
            }
            const form = this.$refs.chatForm;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const formData = new FormData(form);
            formData.append('serviceType', 'partnerChat');
            const uploadResponse = await $.ajax({
                url: FILE_SERVER_URL + '/api/uploadFileByAnonymous',
                processData: false,
                contentType: false,
                data: formData,
                type: 'POST',
            })
            let fileId;
            if (uploadResponse.result) {
                const uploadSaveResponse = await $.post(SAMPLEPCB_URL + '/shop/sp_file_api.php?w=s', uploadResponse.data[0]);
                if (uploadSaveResponse.result) {
                    fileId = uploadSaveResponse.data;
                }
            }
            let chat = {
                partnerOrderId: this.params.partnerOrderId,
                itId: this.params.itId,
                senderId: this.params.senderId,
                receiverId: this.params.receiverId,
                contents: this.message,
            } as any;
            if (fileId) {
                chat.fileId = fileId;
                $.extend(chat, uploadResponse.data[0]);
            }
            $.ajax({
                url: SAMPLEPCB_URL + '/adm/shop_admin/partner_chat_api.php?w=s',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(chat)
            }).done(async (/*response*/) => {
                socket.emit("event_broadcast_by_rooms", {
                    eventName: 'onMessage',
                    idList: [this.params.receiverId],
                    data: chat
                });
                this.chatList.push(chat);
                this.message = '';
                this.chatEndScroll();
            });
        },
        chatEndScroll() {
            nextTick().then(() => {
                const $chat = $("#chat");
                $chat.scrollTop($chat[0].scrollHeight);
            });
        },
        // 스크룰이 끝이 아니라면 끝으로 이동
        checkEndScroll() {
            nextTick().then(() => {
                const $chat = $('#chat');
                const scrollTop = $chat.scrollTop();
                const innerHeight = $chat.innerHeight();
                const scrollHeight = $chat.prop('scrollHeight');
                if (scrollTop === undefined || innerHeight === undefined) {
                    return;
                }
                if (scrollHeight <= innerHeight) {
                    return;
                }
                if (scrollTop + innerHeight >= scrollHeight) {
                    console.log('스크롤 끝');
                } else {
                    $chat.scrollTop($chat[0].scrollHeight);
                }
            });
        },
        getFilenameByPath(path: string) {
            if (path) {
                return path.replace(/^.*[\\/]/, '');
            }
            return '';
        },
        dropUpload(ev: any) {
            // Prevent default behavior (Prevent file from being opened)
            ev.preventDefault();

            if (ev.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                [...ev.dataTransfer.items].forEach((item, i) => {
                    // If dropped items aren't files, reject them
                    if (item.kind === 'file') {
                        const file = item.getAsFile();
                        const fd = new FormData();
                        fd.append('file', file);
                        if (DataTransfer) {
                            var container = new DataTransfer();
                            container.items.add(file);
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            this.$refs.chatForm.file.files = container.files;
                        }
                    }
                });
            } else {
                // 사용 안함
                // Use DataTransfer interface to access the file(s)
                // [...ev.dataTransfer.files].forEach((file, i) => {
                // });
            }
        }
    }
});
</script>

<style lang="scss">
.chat-box {
    margin: 0 auto;
    width: calc(100% - 10px);
}
.chat {
    overflow-y: scroll;
    height: 500px;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.17);
    margin-bottom: 10px;

    .you {
        color: blue;
        float: left;
        margin-right: 50px;
        background-color: #423737;
    }

    .me {
        color: red;
        float: right;
        margin-left: 50px;
        background-color: #d6e1ff;
    }

    .you, .me {
        clear: both;
        margin-bottom: 5px;
        color: #333;
        border-radius: 10px 10px 0 10px;
        padding: 10px;
        max-width: 70%;

        span {
            display: inline-block;
            background-color: #f1f0f0;
            padding: 5px;
            border-radius: 10px;
            margin-bottom: 5px;

            & + span {
                margin-right: 10px;
            }
        }
    }

    .fi a {
        display: inline-block;
        background-color: #e27cfc;
        color: #333;
        padding: 5px 10px;
        border-radius: 10px;
        font-size: 14px;
        margin-top: 5px;
    }

    .dt {
        font-size: 10px;
        color: #aaa;
        margin: 3px 0 0 3px;
    }
}

.chat-form {
    textarea {
        font-family: 'Arial', sans-serif;
        font-size: 16px;
        width: 100%;
        //max-width: 500px;
        min-height: 100px;
        padding: 12px 20px;
        margin: 8px 0;
        box-sizing: border-box;
        border: 2px solid #ccc;
        border-radius: 4px;
        background-color: #f8f8f8;
        resize: vertical;
        transition: border-color 0.3s;
    }

    .send {
        margin-top: 8px;
        margin-left: 5px;
        height: 100px;
    }
}

.send-box {
    display: flex;
}
</style>
