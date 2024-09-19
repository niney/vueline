<template>
    <div>
        <!-- 파일 업로드 폼 -->
        <form id="fileUploadForm" @submit.prevent="uploadFile">
            <input type="file" id="fileInput" name="file" @change="fileChanged"/>
            <button type="submit">Upload</button>
        </form>
        <!-- 로딩 표시 -->
        <div v-if="isLoading" style="margin-top: 10px;">로딩중...</div>
        <div style="margin-top: 10px;">헤더의 위치 : {{ data.headerColumnIdx + 1 }}</div>
        <ul
            style="
        margin-top: 10px;
        display: inline-flex;
        flex-wrap: wrap;
        list-style-type: none;
        padding: 0;"
            v-for="header in data.headerList"
            v-bind:key="header"
        >
            <li style="
        background-color: #f0f0f0;
        margin-right: 10px;
        padding: 5px 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                {{ header.columnIdx + 1 }} : {{ targetToStr(header.target) }}
            </li>
        </ul>

        <ul
            style="
        margin-top: 10px;
        padding: 0;"
            v-for="item in data.itemDetail"
            v-bind:key="item"
        >
            <li style="
        margin-bottom: 5px;
        padding: 5px;
        background-color: #f9f9f9;
        border-left: 3px solid #3498db;">
                {{ item.columnIdx + 1 }}: {{ item.classificationResult.searchText }}
            </li>
            <li>
        <span
            style="
                display: inline-block;
                padding: 10px;
                background-color: #e7e7e7;
                margin-right: 5px;
                margin-bottom: 5px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);"
            v-for="(piece, pKey) in item.classificationResult.originalClassification"
            v-bind:key="pKey"
        >
            {{ pKey }}: {{ piece }}
        </span>
                <div v-if="item.classificationResult.part">
                    [{{ item.classificationResult.part.manufacturer }}]
                    <div class="item cpv">{{ item.classificationResult.part.mpn }}</div>
                    <div class="item">{{ item.classificationResult.part.name }}</div>
                    <div>{{ item.classificationResult.part.short_description }}</div>
                </div>
            </li>
        </ul>

    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {VueCommonParams} from "@/model/vue-common-params";

let that: any;
export default defineComponent({
    name: 'SamBomApp',
    props: {
        params: {
            type: Object as () => VueCommonParams,
            required: true
        }
    },
    data() {
        return {
            that: {},
            selectedFile: null,
            data: {} as any,
            isLoading: false
        }
    },
    beforeCreate() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        that = this;
    },
    // created() {
    // },
    // mounted() {
    // },
    methods: {
        fileChanged(event: any) {
            this.selectedFile = event.target.files[0];
        },
        uploadFile() {
            if (!this.selectedFile) {
                alert('파일을 선택해주세요.');
                return;
            }

            let formData = new FormData();
            formData.append('file', this.selectedFile);

            this.isLoading = true;  // 로딩 시작
            this.data = {};

            // noinspection TypeScriptValidateJSTypes
            $.ajax({
                // url: 'http://localhost:8099/api/analysisColumn',
                url: 'https://ml.samplepcb.kr/api/analysisColumn',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: (response) => {
                    this.data = response.data;
                    this.isLoading = false;  // 로딩 완료
                },
                error: (error) => {
                    console.log('Upload error: ', error);
                    this.isLoading = false;  // 로딩 완료
                }
            });
        },
        targetToStr(target: number) {
            switch (target) {
                case 99:
                    return '순번';
                case 1:
                    return '레퍼런스';
                case 2:
                    return '품명';
                case 3:
                    return '상세';
                case 4:
                    return '수량';
                case 5:
                    return '제조사';
                case 6:
                    return '패키지';
                case 9:
                    return '값';
                case 10:
                    return '오차범위';
            }
        },
    }
});
</script>

<style lang="scss">
.item {
    display: inline-block;
    margin-right: 20px;
    margin-bottom: 5px;
}

.cpv {
    color: blueviolet;
}
</style>
