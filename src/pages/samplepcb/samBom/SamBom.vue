<template>
    <div>
        <!-- 파일 업로드 폼 -->
        <form id="fileUploadForm" @submit.prevent="uploadFile">
            <input type="file" id="fileInput" name="file" @change="fileChanged"/>
            <button type="submit">Upload</button>
        </form>
        <!-- 로딩 표시 -->
        <div v-if="isLoading" style="margin-top: 10px;">로딩중...</div>

        <!-- 데이터가 있을 때만 렌더링 -->
        <div v-if="data.length > 0" style="margin-top: 10px;">
            <ul v-for="(item, index) in data" :key="index" style="list-style-type: none; padding: 0;">
                <li class="bom-row" :class="{'has-parts': item.part_number?.length > 0 || isPartsFieldExists(item.parts)}">
                    <!-- 왼쪽 영역: 기본 정보 -->
                    <div class="bom-left">
                        <div>행 번호: {{ item.row_idx }}</div>
                        <div>순번: {{ item.increment_number?.join(', ') }}</div>
                        <div>레퍼런스 접두사: {{ item.reference_prefix }}</div>
                        <div>패키지: {{ item.package?.join(', ') || '없음' }}</div>
                        <div class="part-number">Part Number : {{ item.part_number?.join(', ') || '없음' }}</div>
                        <div>Part Number Candidate: {{ item.part_number_candidate?.join(', ') || '없음' }}</div>
                        <div>값: {{ item.number?.join(', ') }}</div>

                        <!-- 세부 값 -->
                        <div v-if="item.values" class="values-section">
                            <div v-for="(value, key, vIndex) in item.values" :key="vIndex">
                                <div>{{ key }}: {{ value.value }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 오른쪽 영역: parts 정보 -->
                    <div v-if="item.parts" class="bom-right">
                        <div class="parts-section">
                            <div><strong>Parts 정보:</strong></div>
                            <div>설명: {{ item.parts.description }}</div>
                            <div>제조사: {{ item.parts.manufacturerName }}</div>
                            <div>카테고리: {{ item.parts.largeCategory }} > {{ item.parts.mediumCategory }}</div>
                            <div>온도: {{ item.parts.temperature }}</div>

                            <!-- prices 정보 -->
                            <div v-if="item.parts.prices" class="prices-section">
                                <div><strong>가격 정보:</strong></div>
                                <div v-for="(price, pIndex) in item.parts.prices" :key="pIndex" class="price-item">
                                    <div>패키지: {{ price.pkg }}</div>
                                    <div>최소주문수량: {{ price.moq }}</div>
                                    <div>재고: {{ price.stock }}</div>
                                    <div v-if="price.priceSteps" class="price-steps">
                                        <div>가격 단계:</div>
                                        <div v-for="(step, sIndex) in price.priceSteps" :key="sIndex">
                                            {{ step.breakQuantity }}개 이상: {{ step.unitPrice }}원
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {VueCommonParams} from "@/model/vue-common-params";

let that: any;

interface BomItem {
    row_idx: number;
    increment_number?: string[];
    reference_prefix?: string;
    package?: string[];
    part_number?: string[];
    part_number_candidate?: string[];
    number?: string[];
    values?: Record<string, { value: string }>;
    parts?: {
        description?: string;
        manufacturerName?: string;
        largeCategory?: string;
        mediumCategory?: string;
        temperature?: string;
        prices?: Array<{
            pkg: string;
            moq: number;
            stock: number;
            priceSteps?: Array<{
                breakQuantity: number;
                unitPrice: number;
            }>;
        }>;
    };
}

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
            data: [] as any[],  // 데이터를 배열로 변경
            isLoading: false
        }
    },
    beforeCreate() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        that = this;
    },
    methods: {
        // parts에 유효한 필드가 하나라도 존재하는지 확인
        isPartsFieldExists(parts: any) {
            if (!parts) return false;
            return Object.values(parts).some(field => field !== null && field !== undefined);
        },
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
            this.data = [];

            // noinspection TypeScriptValidateJSTypes
            $.ajax({
                url: 'http://localhost:8099/api/analysis',
                // url: 'https://ml.easypcb.co.kr/api/analysis',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: (response) => {
                    this.data = response;
                    this.isLoading = false;  // 로딩 완료
                },
                error: (error) => {
                    console.log('Upload error: ', error);
                    this.isLoading = false;  // 로딩 완료
                }
            });
        }
    },
    computed: {
        leftColumnData(): BomItem[] {
            return this.data.filter((_, index) => index % 2 === 0);
        },
        rightColumnData(): BomItem[] {
            return this.data.filter((_, index) => index % 2 === 1);
        }
    }
});
</script>

<style lang="scss">
.bom-row {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);

    &.has-parts {
        background-color: #e3f2fd;
        color: #0d47a1;
    }
}

.bom-left {
    flex: 1;
    min-width: 0;
}

.bom-right {
    flex: 1;
    min-width: 0;
    border-left: 1px solid #e0e0e0;
    padding-left: 20px;
}

.part-number {
    color: red;
    font-weight: bold;
}

.parts-section {
    margin-top: 10px;
    border-left: 3px solid #2196f3;
    padding-left: 10px;
}

.prices-section {
    margin-top: 5px;
}

.price-item {
    margin-bottom: 10px;
    padding: 5px;
    background-color: rgba(255,255,255,0.5);
    border-radius: 4px;
}

.price-steps {
    margin-top: 5px;
    padding-left: 10px;
}

.values-section {
    margin-top: 5px;
    padding: 5px;
    background-color: rgba(255,255,255,0.3);
    border-radius: 4px;
}

.item {
    display: inline-block;
    margin-right: 20px;
    margin-bottom: 5px;
}

.cpv {
    color: blueviolet;
}
</style>
