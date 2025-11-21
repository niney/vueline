<template>
    <div class="bom-eye-bg" :class="{ 'hidden': hasItId }">
        <div class="section analysis-section">
            <div class="intro">
                <div class="slide">
                    <div class="left-area-message">
                        <div class="message">
                            <strong class="top">Smart BOM <span style="color: #a8dfe6">"Parts Eye"</span> 런칭</strong>
                            <div>BOM 한꺼번에 검색하기</div>
                        </div>
                        <div class="sub-message">
                            <div>이제 AI가 빠르고 쉽게 부품구매를 도와 드립니다.</div>
                            <div>BOM 파일만 업로딩하면 됩니다.</div>
                        </div>
                    </div>
                    <div class="filebox-container flex-1">
                        <div class="filebox-area" @drop="dropUploadAnalysis($event);" @dragover="dropOverUploadAnalysis($event);">
                            <div class="right flex-1">
                                <img src="https://www.samplepcb.co.kr/img/bom/upload_bk.png" style="margin-bottom: 10px;" alt="업로드 표시"/>
                                <p>Part Match in 30 Sec</p>
                            </div>
                            <div class="filebox bs3-primary flex-1">
                                <form name="upload_form" method="post" enctype="multipart/form-data" action="">
                                    <label for="bom_file" style="width: 225px;">Upload BOM File</label>
                                    <input type="file" id="bom_file" name="file" @change="uploadAnalysis($event)"/>
                                </form>
                                <div style="color: #a6b2c7;">엑셀파일만 업로드 가능</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="slide feat-list sub-message">
                    <div class="slide-box">
                        <img src="//www.samplepcb.co.kr/img/bom/bom_feat1.png" alt="ai"/>
                        <span class="txt">AI 실시간검색</span>
                        <span class="sub-txt">전 세계 재고현황</span>
                    </div>
                    <div class="slide-box">
                        <img src="//www.samplepcb.co.kr/img/bom/bom_feat2.png" alt="1min"/>
                        <span class="txt">1분 이내</span>
                        <span class="sub-txt">검색소요시간</span>
                    </div>
                    <div class="slide-box">
                        <img src="//www.samplepcb.co.kr/img/bom/bom_feat3.png" alt="search"/>
                        <span class="txt">일괄검색</span>
                        <span class="sub-txt">BOM 파일(엑셀파일)</span>
                    </div>
                    <div class="slide-box">
                        <img src="//www.samplepcb.co.kr/img/bom/bom_feat4.png" alt="dv"/>
                        <span class="txt">빠른배송</span>
                        <span class="sub-txt">평균 1~2주 이내</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="search-box">
            <div class="search">
                <div class="title">단일검색</div>
                <div class="search-input">
                    <input
                        type="text"
                        id="tbPartNumber"
                        placeholder="전자부품 번호(P/N)로 검색하세요!"
                        v-model="searchQuery"
                        @keyup.enter="searchItems"
                    >
                    <input type="submit" value="검색" @click="searchItems">
                </div>
                <div class="search-right-btn">
                    <button class="btn-success-round" style="margin-right: 10px;" onclick="location.href = '/shop/bom_sell.php'">
                        파트너 등록
                    </button>
                    <button class="btn-success-round" onclick="location.href = '/shop/bom_sell.php'">
                        과잉재고 등록
                    </button>
                </div>
            </div>
        </div>
    </div><!-- bom-eye-bg -->

    <div v-if="viewMode === 'none'" class="page-contents">
        <div style="margin-top: 130px; text-align: center;">
            <div class="gmarket-sans-mid" style="font-size: 30px;">
                <p>Smart BOM <span class="gmarket-sans-bold" style="color: #23b59c">"Parts Eye"</span>은 부품구매 어려움을</p>
                <p>해결하기 위하여 개발하였습니다</p>
            </div>
        </div>
        <div style="margin-top: 100px; display: flex; justify-content: space-around;">
            <div style="margin-top: 90px;">
                <p style="font-size: 36px;" class="gmarket-sans-light">한개씩 재고/가격확인하며</p>
                <p style="font-size: 36px;" class="gmarket-sans-bold">부품구매 많이 힘드셨죠?</p>
                <p style="font-size: 24px; margin-top: 20px;">SAMPLE PCB의 새로운 구매시스템의 새로운 경험을 해보세요.</p>
                <p class="gmarket-sans-mid">AI가 국내외 재고보유 협력딜러의 실시간 확인 가능힙니다</p>
                <p class="gmarket-sans-mid">한꺼번에 부품검색 후 가격 및 실시간 재고 확인 가능합니다</p>
            </div>
            <div><img src="https://www.samplepcb.co.kr/img/bom/bom_search_intro.png" alt="BOM검색"></div>
        </div>

        <div style="margin-top: 30px; text-align: center; display: grid; justify-content: center;">
            <img src="https://www.samplepcb.co.kr/img/bom/bom_provider.png" alt="공급사">
            <p style="margin-top: 130px; font-size: 30px;" class="gmarket-sans-mid">이제 부품검색에서 주문까지 <span
                class="gmarket-sans-bold">단2분</span></p>
            <div class="gmarket-sans-mid" style="margin-top: 130px; font-size: 30px;">
                <p>Smart BOM <span class="gmarket-sans-bold" style="color: #a8dfe6">"Parts Eye"</span>을 공급사 및 구매자가</p>
                <p>함께 참여하는 플랫폼입니다</p>
            </div>
        </div>

        <div style="margin-top: 120px; display: flex; justify-content: space-around;">
            <div>
                <p style="font-size: 36px;" class="gmarket-sans-bold">공급가능한 업체는</p>
                <p style="font-size: 36px;" class="gmarket-sans-light">누구나 참여 가능합니다.</p>
                <div style="margin-top: 50px;">
                    <button class="btn-nav-round"
                            onclick="location.href = '/bbs/member_confirm.php?url=register_form.php'">파트너 재고 등록
                    </button>
                </div>
            </div>
            <img src="https://www.samplepcb.co.kr/img/bom/bom_partner.png" alt="파트너">
        </div>

        <div style="margin-top: 120px; display: flex;">
            <div class="flex-item">
                <p style="font-size: 50px;" class="gmarket-sans-light">회사에 남아있는</p>
                <p style="font-size: 50px;" class="gmarket-sans-bold">잉여부품들 고민이시죠?</p>
                <p style="font-size: 20px;">Sample PCB를 이용하여 판매하는건 어떨까요?</p>
                <div style="margin-top: 20px;">
                    <p style="font-size: 18px; font-style: italic; color: #303778;">온라인 플랫폼 Samplepcb는</p>
                    <p style="font-size: 18px; font-style: italic; color: #303778;">PCB개발에서 조립생산까지 One-Stop 서비스를 제공합니다.</p>
                </div>
            </div>
            <div class="flex-item flex-center" style="margin-left: 220px; flex-direction: column; align-items: start;">
                <p style="font-size: 30px;" class="gmarket-sans-mid"><span class="gmarket-sans-bold">불필요한 부품</span>을 공유하여 돈을 벌자</p>
                <button class="btn-nav-round" onclick="location.href = '/shop/parts/form.php'">과잉/불용 재고등록</button>
            </div>
        </div>
        <div style="margin-top: 8px;"><img src="https://www.samplepcb.co.kr/img/bom/bom_reg.png" alt="부품등록"></div>
    </div>

    <!-- 분석 결과 영역 -->
    <div class="basic-page-contents" v-show="viewMode === 'upload'">
        <div class="result_area_top mt-5 px-5">
            <div class="flex items-center">
                <i class="fas fa-file text-gray-600 mr-1"></i>
                <span class="text-gray-700">파일명: {{ fileName || '파일을 선택해주세요' }}</span>
                <button type="button" class="btn btn-outline-primary ml-2" onclick="$('#bom_file').trigger('click')">
                    파일 재업로드
                </button>
                <span v-if="cartData.it_name" class="text-gray-700 ml-2">장바구니 BOM 이름 : {{ cartData.it_name }}</span>
                <span class="ml-auto">※ AI 예측한 예상금액이므로 견적승인 후 금액이 확정됩니다.</span>
            </div>
        </div>

        <!-- 테이블 스타일 전환 버튼 -->
        <div class="flex justify-center mt-4">
            <button
                class="btn btn-outline-primary mr-2"
                @click="tableStyle = 'default'"
                :class="{'btn-primary text-white': tableStyle === 'default'}"
            >
                기본 스타일
            </button>
            <button
                class="btn btn-outline-primary"
                @click="tableStyle = 'alternative'"
                :class="{'btn-primary text-white': tableStyle === 'alternative'}"
            >
                대체 스타일
            </button>
        </div>

        <!-- 새로 추가되는 분석 결과 영역 -->
        <div class="analysis-results grid grid-cols-3 gap-4 px-5 py-3 bg-white">
            <!-- AI 분석 결과 -->
            <div class="result-box border rounded-lg p-4">
                <div class="flex items-center mb-3">
                    <i class="fas fa-robot text-blue-500 mr-2"></i>
                    <h3 class="text-lg font-medium">AI분석 결과</h3>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">BOM 수</span>
                        <span class="font-medium">{{ pcbItemList.length }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">선택수</span>
                        <span class="font-medium">{{ selectedCount }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 text-red-500">변경부품</span>
                        <span class="font-medium text-red-500">0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">매칭부품</span>
                        <span class="font-medium">{{ matchedCount }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600 text-red-500">비매칭수</span>
                        <span class="font-medium text-red-500">{{ unmatchedCount }}</span>
                    </div>
                </div>
            </div>

            <!-- 단가 및 납기정보 -->
            <div class="result-box border rounded-lg p-4">
                <div class="flex items-center mb-3">
                    <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                    <h3 class="text-lg font-medium">단가 및 납기정보</h3>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">구매수량</span>
                        <span class="font-medium">1 Set</span>
                    </div>
                    <!-- <div class="flex justify-between">
                        <span class="text-gray-600">샘플단가</span>
                        <span class="font-medium">₩20,000원</span>
                    </div> -->
                    <div class="flex justify-between">
                        <span class="text-gray-600">예상납기</span>
                        <span class="font-medium">{{ orderSummary.expectedDelivery }}</span>
                    </div>
                </div>
            </div>

            <!-- 추정 예상금액 -->
            <div class="result-box border rounded-lg p-4">
                <div class="flex items-center mb-3">
                    <i class="fas fa-calculator text-blue-500 mr-2"></i>
                    <h3 class="text-lg font-medium">추정 예상금액</h3>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">합계</span>
                        <span class="font-medium">₩{{ formatPrice(totalAmount) }}원</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">운송료</span>
                        <template v-if="isEditMode">
                            <div class="flex items-center">
                                <span class="mr-1">₩</span>
                                <input
                                    type="number"
                                    v-model.number="orderSummary.shippingFee"
                                    class="w-24 px-2 py-1 border rounded text-right"
                                    min="0"
                                />
                                <span class="ml-1">원</span>
                            </div>
                        </template>
                        <template v-else>
                            <span class="font-medium">₩{{ formatPrice(orderSummary.shippingFee) }}원</span>
                        </template>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600">구매대행 관리비</span>
                        <template v-if="isEditMode">
                            <div class="flex items-center">
                                <span class="mr-1">₩</span>
                                <input
                                    type="number"
                                    v-model.number="orderSummary.managementFee"
                                    class="w-24 px-2 py-1 border rounded text-right"
                                    min="0"
                                />
                                <span class="ml-1">원</span>
                            </div>
                        </template>
                        <template v-else>
                            <span class="font-medium">₩{{ formatPrice(orderSummary.managementFee) }}원</span>
                        </template>
                    </div>
                    <div class="flex justify-between mt-2 pt-2 border-t">
                        <span class="text-gray-800 font-medium">최종합계<span class="text-gray-500">(부가세 미포함)</span></span>
                        <span class="font-bold text-lg">₩{{ formatPrice(finalAmount) }}원</span>
                    </div>
                </div>
                <div class="flex justify-center gap-4 mt-4 pt-4 border-t">
                    <template v-if="isEditMode">
                        <button class="btn btn-outline-success" @click="handleSave">
                            <i class="fas fa-save"></i>
                            저장하기
                        </button>
                    </template>
                    <template v-else>
                        <button class="btn btn-outline-primary" @click="handleRequestQuote">
                            <i class="fas fa-file-invoice"></i>
                            견적요청
                        </button>
                        <button class="btn btn-outline-orange" @click="handleAddToCart">
                            <i class="fas fa-shopping-cart"></i>
                            장바구니
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <!-- 분석 결과 테이블 -->
        <div v-if="tableStyle === 'default'">
            <AnalysisResultTable
                v-model:pcbItems="pcbItemList"
                v-model:selectAll="selectAll"
                :is-edit-mode="isEditMode"
            />
        </div>
        <div v-else>
            <AnalysisResultTableAlternative
                v-model:pcbItems="pcbItemList"
                v-model:selectAll="selectAll"
                :is-edit-mode="isEditMode"
                @changeItem="openSearchPopup"
            />
        </div>
    </div>

    <!-- 검색 결과 영역 -->
    <div v-show="viewMode === 'search'" class="basic-page-contents p-6">
        <SearchResultsTable
            :pcb-items="searchPcbItems"
            @add-to-cart="handleSearchItemAddToCart"
        />
    </div>

    <!-- 검색 팝업 -->
    <SearchPopup
        :isOpen="isSearchPopupOpen"
        :currentItem="currentSearchItem || undefined"
        :itemIndex="currentSearchItemIndex"
        :searchServerUrl="params.searchServerUrl || ''"
        @close="closeSearchPopup"
        @select-item="replaceItem"
    />

    <!-- 글로벌 로딩 오버레이 -->
    <div v-if="isLoading" class="global-loading-overlay">
        <div class="spinner-container">
            <div class="lds-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div class="loading-text">로딩중...</div>
        </div>
    </div>
</template>

<script lang="ts">
import "./sp-smart-bom-style.scss";
import "@/assets/styles/btn.scss";
import "@/assets/styles/table.scss";
import {defineComponent} from 'vue';
import {CartApiResponse, CartItem, OrderSummary, Part, PcbItem, Price, SpSmartBomParams} from "@/model/sp-smart-bom-params";
import {SAMPLEPCB_URL} from "@/app-constants";
import AnalysisResultTable from "@/components/AnalysisResultTable.vue";
import AnalysisResultTableAlternative from "@/components/AnalysisResultTableAlternative.vue";
import SearchResultsTable from "@/components/SearchResultsTable.vue";
import SearchPopup from "@/components/SearchPopup.vue";
import * as XLSX from 'xlsx';

let that: any;
export default defineComponent({
    name: 'SpSmartBom',
    components: {
        AnalysisResultTable,
        AnalysisResultTableAlternative,
        SearchResultsTable,
        SearchPopup
    },
    props: {
        params: {
            type: Object as () => SpSmartBomParams,
            required: true
        }
    },
    data() {
        return {
            that: {},
            viewMode: '' as '' | 'none' | 'search' | 'upload',
            searchQuery: '',
            selectedFile: null,
            data: {} as any,
            isLoading: false,
            searchPcbItems: [] as PcbItem[],
            orderSummary: this.getDefaultOrderSummary(),
            pcbItemList: [] as (PcbItem & { selected?: boolean })[],
            selectAll: false,
            fileName: '',
            cartData: {} as CartItem,
            hasItId: false,
            isEditMode: false,
            tableStyle: 'alternative' as 'default' | 'alternative',
            isSearchPopupOpen: false,
            currentSearchItem: null as PcbItem | null,
            currentSearchItemIndex: -1,
            lastUploadedFileName: '',
            lastUploadedFileSize: 0,
            lastUploadedFileTime: 0,
        };
    },
    beforeCreate() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        that = this;
    },
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const itId = urlParams.get('it_id');
        const mode = urlParams.get('mode');

        this.isEditMode = mode === 'edit';

        if (itId) {
            this.hasItId = true;
            const params: Record<string, string | number> = {
                w: 'rc',
                caId: 41,
                itId: itId
            };
            $.get(SAMPLEPCB_URL + '/shop/cart_api.php', params).then((response: CartApiResponse) => {
                if (!response.result) {
                    return;
                }
                this.cartData = response.data[0];
                this.pcbItemList = JSON.parse(this.cartData['it_explan'])[0];
                try {
                    this.orderSummary = JSON.parse(this.cartData['it_basic']);
                } catch (error) {
                    console.error('주문 요약 정보 파싱 오류:', error);
                    this.orderSummary = this.getDefaultOrderSummary();
                }
                this.viewMode = 'upload';
            })
            .catch((error) => {
                console.error('API Error:', error);
            });
        }

        if (!itId && !this.isEditMode) {
            this.viewMode = 'none';
        }
    },
    methods: {
        getDefaultOrderSummary(): OrderSummary {
            return {
                fileName: '',
                quantity: 1,
                expectedDelivery: '2주',
                shippingFee: 30000, // 배송비
                managementFee: 25000, // 구매대행 관리비
                totalAmount: 0,
                finalAmount: 0
            };
        },
        setFileName(name: string): void {
            this.fileName = name;
            this.orderSummary.fileName = name;
        },
        searchItems() {
            if (!this.searchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }

            this.isLoading = true;
            this.searchPcbItems = [];

            const searchUrl = this.params.searchServerUrl;

            $.ajax({
                url: searchUrl,
                type: 'GET',
                data: {
                    q: this.searchQuery,
                    qf: 'parsing'
                },
                success: (response) => {
                    if (response.result && response.data) {
                        this.searchPcbItems = response.data.map((item: Part) => ({
                            increment_number: [''],
                            number: [''],
                            package: [''],
                            part_number: [item.partName],
                            part_number_candidate: [item.partName],
                            reference_value: '',
                            row_idx: 0,
                            value: [''],
                            values: {},
                            parts: item,
                            selectedPrice: {
                                qty: 1,
                                pkg: 'Cut Tape (CT)',
                                breakQuantity: 1,
                                unitPrice: item.price1 || 0,
                                moq: item.moq || 1,
                                stock: 0
                            }
                        }));
                    } else {
                        this.searchPcbItems = [];
                    }
                    this.isLoading = false;

                    if (this.searchPcbItems.length === 0) {
                        alert('검색 결과가 없습니다.');
                    }
                    this.viewMode = 'search';
                },
                error: (error) => {
                    console.error('Search error:', error);
                    alert('검색 중 오류가 발생했습니다.');
                    this.isLoading = false;
                }
            });
        },
        getHighlights(highlight: any) {
            if (!highlight) return '';
            return Object.entries(highlight)
                .map(([key, value]) => {
                    // 키에서 .field1.keyword 부분 제거
                    const cleanKey = key.split('.')[0];

                    // 값에서 <em> 태그 제거
                    const cleanValue = Array.isArray(value)
                        ? value[0].replace(/<\/?em>/g, '')
                        : String(value).replace(/<\/?em>/g, '');

                    return `${cleanKey} : ${cleanValue}`;
                })
                .join(', ');
        },
        uploadAnalysis(event: Event) {
            this.isLoading = true;
            this.pcbItemList = [];
            this.selectAll = false;

            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                console.error('파일이 선택되지 않았습니다.');
                this.isLoading = false;
                return;
            }

            // 같은 파일 재업로드 허용: 파일 정보 저장
            const currentFileInfo = {
                name: file.name,
                size: file.size,
                time: Date.now()
            };

            // 같은 파일이라도 1초 이상 간격이 있으면 재업로드 허용
            if (this.lastUploadedFileName === file.name &&
                this.lastUploadedFileSize === file.size &&
                (Date.now() - this.lastUploadedFileTime) < 1000) {
                console.log('너무 빠른 재업로드 시도');
                this.isLoading = false;
                return;
            }

            this.lastUploadedFileName = currentFileInfo.name;
            this.lastUploadedFileSize = currentFileInfo.size;
            this.lastUploadedFileTime = currentFileInfo.time;

            this.setFileName(file.name);

            // 엑셀 파일 읽기 및 분석
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    // 셀 스타일, 공식, 날짜 형식 포함하여 읽기
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellStyles: true,
                        cellFormula: true,
                        cellDates: true,
                        raw: false
                    });


                    // 모든 시트의 전체 데이터를 추출 (헤더 상관없이)
                    const allExcelData: any = {
                        fileName: file.name,
                        fileSize: file.size,
                        sheets: []
                    };

                    workbook.SheetNames.forEach((sheetName/*, index*/) => {
                        const worksheet = workbook.Sheets[sheetName];

                        // 시트의 범위 정보
                        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

                        // 시트 전체 데이터 추출
                        const sheetData: any = {
                            name: sheetName,
                            range: {
                                startRow: range.s.r,
                                endRow: range.e.r,
                                startCol: range.s.c,
                                endCol: range.e.c
                            },
                            cells: []
                        };

                        // 모든 셀 데이터 추출 (행 제한 없이)
                        for (let row = range.s.r; row <= range.e.r; row++) {
                            for (let col = range.s.c; col <= range.e.c; col++) {
                                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                                const cell = worksheet[cellAddress];

                                if (cell) {
                                    // 셀 상세 정보 추출
                                    const cellInfo = {
                                        address: cellAddress,
                                        row: row,
                                        col: col,
                                        formatted: cell.w || '',      // 서식화된 텍스트 (Excel에서 보이는 대로)
                                        raw: cell.v,                  // 원본 값
                                        type: cell.t || 'z',          // 데이터 타입 (s=문자열, n=숫자, b=불린, d=날짜, z=빈값)
                                        format: cell.z || '',         // 숫자 형식 코드
                                        formula: cell.f || '',        // 공식
                                        style: cell.s || null         // 스타일 정보
                                    };

                                    sheetData.cells.push(cellInfo);
                                }
                            }
                        }

                        // 끝에서부터 검사하여 빈 행 제거
                        const nonEmptyRows = new Set();
                        sheetData.cells.forEach((cell: any) => {
                            if (cell.formatted && cell.formatted.toString().trim() !== '') {
                                nonEmptyRows.add(cell.row);
                            }
                        });

                        // 빈 행이 아닌 행들만 포함하도록 필터링
                        if (nonEmptyRows.size > 0) {
                            const maxNonEmptyRow = Math.max(...Array.from(nonEmptyRows) as number[]);
                            sheetData.cells = sheetData.cells.filter((cell: any) => cell.row <= maxNonEmptyRow);
                            sheetData.range.endRow = maxNonEmptyRow;
                        }

                        allExcelData.sheets.push(sheetData);

                    });

                    // API 서버에 파일과 추출된 데이터 전송

                    // FormData 생성
                    let formData = new FormData();
                    formData.append('file', file);
                    formData.append('excelData', JSON.stringify(allExcelData));

                    $.ajax({
                        url: this.params.mlServerUrl,
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: (response) => {
                            this.pcbItemList = response.map((item: PcbItem) => {
                                const newItem = {
                                    ...item,
                                    selected: !!item.parts,
                                };
                                this.updateSelectedPrice(newItem);  // 초기 가격 정보 설정
                                return newItem;
                            });
                            this.updateSelectAll();
                            this.isLoading = false;
                            this.viewMode = 'upload';

                            // 파일 입력 필드는 초기화하지 않음 (다른 곳에서 사용 가능)
                        },
                        error: (error) => {
                            console.error('❌ ML 서버 BOM 분석 오류:', error);
                            this.isLoading = false;
                            alert(`BOM 분석 실패!\n\n오류 내용:\n${error.responseText || error.statusText || '알 수 없는 오류'}\n\n자세한 내용은 콘솔을 확인해주세요.`);

                            // 파일 입력 필드는 초기화하지 않음 (다른 곳에서 사용 가능)
                        }
                    });

                } catch (error) {
                    console.error('❌ 엑셀 파일 읽기 오류:', error);
                    this.isLoading = false;
                    alert('엑셀 파일 읽기 중 오류가 발생했습니다. 콘솔을 확인해주세요.');

                    // 파일 입력 초기화 (같은 파일 다시 선택 가능하게)
                    target.value = '';
                }
            };

            reader.onerror = (error) => {
                console.error('❌ 파일 읽기 오류:', error);
                this.isLoading = false;
                alert('파일 읽기 중 오류가 발생했습니다.');

                // 파일 입력 필드는 초기화하지 않음 (다른 곳에서 사용 가능)
            };

            reader.readAsArrayBuffer(file);
        },
        toggleAll() {
            this.pcbItemList.forEach(item => {
                item.selected = this.selectAll;
            });
        },
        updateSelectAll() {
            this.selectAll = this.pcbItemList.every(item => item.selected);
        },
        updateSelectedPrice(product: PcbItem) {
            if (!product.parts || (!product.parts.prices && !product.parts.price1)) {
                product.selectedPrice = undefined;
                return;
            }

            const qty = product.selectedPrice?.qty || product.qty || 1;
            if (product.parts.prices == null) {
                product.selectedPrice = {
                    pkg: 'Cut Tape (CT)',
                    breakQuantity: 1,
                    unitPrice: product.parts.price1 || 0,
                    qty: qty,
                    moq: 1,
                    stock: 0
                };
                return;
            }

            const pkgPriority = ['Cut', 'Digi', 'Bulk', 'Tape'];
            const sortedPrices = [...product.parts.prices].sort((a, b) => {
                const aIndex = pkgPriority.findIndex(pkg => a.pkg.includes(pkg));
                const bIndex = pkgPriority.findIndex(pkg => b.pkg.includes(pkg));
                return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
            });

            for (const price of sortedPrices) {
                if (!price.priceSteps?.length) continue;

                const sortedSteps = [...price.priceSteps].sort((a, b) => b.breakQuantity - a.breakQuantity);

                for (const step of sortedSteps) {
                    if (qty >= step.breakQuantity) {
                        if (!product.selectedPrice || product.selectedPrice.pkg !== price.pkg) {
                            product.selectedPrice = {
                                pkg: price.pkg,
                                breakQuantity: step.breakQuantity,
                                unitPrice: step.unitPrice,
                                qty: qty,
                                moq: price.moq,
                                stock: price.stock
                            };
                        } else {
                            product.selectedPrice.breakQuantity = step.breakQuantity;
                            product.selectedPrice.unitPrice = step.unitPrice;
                            product.selectedPrice.qty = product.qty || 0;
                            product.selectedPrice.moq = price.moq;
                            product.selectedPrice.stock = price.stock;
                        }
                        return;
                    }
                }
            }

            product.selectedPrice = {
                pkg: '',
                breakQuantity: 0,
                unitPrice: 0,
                qty: qty,
                moq: 1,
                stock: 0
            };
        },
        getCalculatedPrice(product: PcbItem): number | null {
            if (!product.selectedPrice) return null;
            return product.selectedPrice.qty * product.selectedPrice.unitPrice;
        },
        formatPrice(price: number | null): string {
            if (price === null) return '-';
            return new Intl.NumberFormat('ko-KR').format(price);
        },
        updateQtyFromSelect(product: PcbItem, price: Price, event: Event) {
            const target = event.target as HTMLSelectElement;
            const qty = parseInt(target.value);
            if (!isNaN(qty)) {
                product.selectedPrice = {
                    pkg: price.pkg,
                    breakQuantity: qty,
                    unitPrice: price.priceSteps.find(step => step.breakQuantity === qty)?.unitPrice || 0,
                    qty: qty,
                    moq: price.moq,
                    stock: price.stock
                };
            } else {
                product.selectedPrice = undefined;
            }
        },
        isUnderMoq(product: PcbItem): boolean {
            const { selectedPrice, parts } = product;
            if (!selectedPrice || !parts?.prices) return false;

            const priceInfo = parts.prices.find(p => p.pkg === selectedPrice.pkg);
            return priceInfo ? selectedPrice.qty < priceInfo.moq : false;
        },
        getMoq(product: PcbItem): number {
            if (!product.parts?.prices || !product.selectedPrice) return 0;
            const selectedPrice = product.parts.prices.find(p => p.pkg === product.selectedPrice?.pkg);
            return selectedPrice?.moq || 0;
        },
        updateQty(product: PcbItem, event: Event | number) {
            let qty: number;

            if (typeof event === 'number') {
                qty = event;
            } else {
                const value = (event.target as HTMLInputElement).value;
                qty = parseInt(value) || 0;
            }

            this.updateProductPrice(product, qty);
        },
        updateProductPrice(product: PcbItem, qty: number) {
            if (!product.selectedPrice) {
                product.selectedPrice = {
                    pkg: '',
                    breakQuantity: 0,
                    unitPrice: 0,
                    qty,
                    moq: 1,
                    stock: 0
                };
                return;
            }

            // 기존 pkg 유지
            const currentPkg = product.selectedPrice.pkg;
            product.selectedPrice.qty = qty;

            // 가격 업데이트
            if (product.parts?.prices) {
                const priceInfo = product.parts.prices.find(p => p.pkg === currentPkg);
                if (priceInfo?.priceSteps) {
                    // 수량에 맞는 가격 구간 찾기
                    const sortedSteps = [...priceInfo.priceSteps].sort((a, b) => b.breakQuantity - a.breakQuantity);
                    for (const step of sortedSteps) {
                        if (qty >= step.breakQuantity) {
                            product.selectedPrice.breakQuantity = step.breakQuantity;
                            product.selectedPrice.unitPrice = step.unitPrice;
                            product.selectedPrice.moq = priceInfo.moq;
                            product.selectedPrice.stock = priceInfo.stock;
                            return;
                        }
                    }
                }
            } else if (product.parts?.price1) {
                // price1만 있는 경우
                product.selectedPrice.breakQuantity = 1;
                product.selectedPrice.unitPrice = product.parts.price1;
                product.selectedPrice.moq = product.parts.moq || 1;
                product.selectedPrice.stock = 0;
            }
        },
        getOrderSummary(): OrderSummary {
            // 최신 totalAmount와 finalAmount 값으로 업데이트
            this.orderSummary.totalAmount = this.totalAmount;
            this.orderSummary.finalAmount = this.finalAmount;

            return this.orderSummary;
        },
        handleRequestQuote() {
            const selectedItems = this.pcbItemList.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('선택된 항목이 없습니다.');
                return;
            }
            this.params.onRequestQuote?.(selectedItems, this.getOrderSummary());
        },
        handleAddToCart() {
            const selectedItems = this.pcbItemList.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('선택된 항목이 없습니다.');
                return;
            }
            this.params.onAddToCart?.(selectedItems, this.getOrderSummary(), this.cartData);
        },
        handleSave() {
            const selectedItems = this.pcbItemList.filter(item => item.selected);
            if (selectedItems.length === 0) {
                alert('선택된 항목이 없습니다.');
                return;
            }
            this.params.onSave?.(selectedItems, this.getOrderSummary(), this.cartData);
        },
        dropUploadAnalysis(event: DragEvent) {
            event.preventDefault();
            if (!event.dataTransfer?.files.length) return;

            const file = event.dataTransfer.files[0];

            // uploadAnalysis와 동일한 로직 실행
            const fakeEvent = {
                target: {
                    files: [file]
                }
            } as any;

            this.uploadAnalysis(fakeEvent);
        },
        dropOverUploadAnalysis(event: DragEvent) {
            event.preventDefault();
        },
        isActiveRange(product: PcbItem, price: Price, step: any): boolean {
            if (!product.selectedPrice) return false;

            // 선택된 가격 정보와 현재 가격 정보가 같은지 확인
            if (product.selectedPrice.pkg !== price.pkg) return false;

            // 현재 수량이 이 가격 범위에 해당하는지 확인
            const qty = product.selectedPrice.qty;

            // 가격 단계를 수량 기준으로 오름차순 정렬
            const sortedSteps = [...price.priceSteps].sort((a, b) => a.breakQuantity - b.breakQuantity);

            // 현재 단계의 인덱스 찾기
            const currentIndex = sortedSteps.findIndex(s => s.breakQuantity === step.breakQuantity);
            const nextStep = sortedSteps[currentIndex + 1]; // 다음 단계

            // 현재 단계의 최소 수량보다 크거나 같고, 다음 단계의 최소 수량보다 작은 경우
            if (nextStep) {
                return qty >= step.breakQuantity && qty < nextStep.breakQuantity;
            } else {
                // 마지막 단계인 경우
                return qty >= step.breakQuantity;
            }
        },
        isActiveSingleRange(product: PcbItem): boolean {
            return !!product.selectedPrice && product.selectedPrice.qty > 0;
        },
        updatePriceStep(product: PcbItem, price: Price, step: any) {
            // 현재 선택된 가격 정보가 있고, 같은 패키지이고, 같은 가격 단계인 경우 업데이트
            if (product.selectedPrice &&
                product.selectedPrice.pkg === price.pkg &&
                product.selectedPrice.breakQuantity === step.breakQuantity) {
                product.selectedPrice.unitPrice = step.unitPrice;
                // 수량이 이미 설정되어 있으면 가격 재계산
                if (product.selectedPrice.qty > 0) {
                    this.updateProductPrice(product, product.selectedPrice.qty);
                }
            }
        },
        updateSinglePrice(product: PcbItem) {
            if (product.selectedPrice && product.parts?.price1) {
                product.selectedPrice.unitPrice = product.parts.price1;
                // 수량이 이미 설정되어 있으면 가격 재계산
                if (product.selectedPrice.qty > 0) {
                    this.updateProductPrice(product, product.selectedPrice.qty);
                }
            }
        },
        handleSearchItemAddToCart(product: PcbItem) {
            this.updateSelectedPrice(product);
            this.pcbItemList.push({
                ...product,
                selected: true
            });
            this.viewMode = 'upload';
        },
        openSearchPopup(item: PcbItem, index: number) {
            this.currentSearchItem = item;
            this.currentSearchItemIndex = index;
            this.isSearchPopupOpen = true;
        },
        closeSearchPopup() {
            this.isSearchPopupOpen = false;
        },
        replaceItem(newItem: PcbItem & { selected?: boolean }, index: number) {
            if (this.pcbItemList && this.pcbItemList.length > 0) {
                newItem.selected = true;
                this.pcbItemList.splice(index, 1, newItem);
            }
        },
    },
    computed: {
        selectedCount(): number {
            return this.pcbItemList.filter(item => item.selected).length;
        },
        matchedCount(): number {
            return this.pcbItemList.filter(item => item.parts).length;
        },
        unmatchedCount(): number {
            return this.pcbItemList.filter(item => !item.parts).length;
        },
        totalAmount(): number {
            const amount = this.pcbItemList
                .filter(item => item.selected && item.selectedPrice)
                .reduce((sum, item) => {
                    const price = this.getCalculatedPrice(item);
                    return sum + (price || 0);
                }, 0);
            return amount;
        },
        finalAmount(): number {
            return this.totalAmount + this.orderSummary.shippingFee + this.orderSummary.managementFee;
        }
    }
});
</script>

<style lang="scss" scoped>
.active-price-range {
    background-color: rgba(0, 123, 255, 0.1);
    border-left: 3px solid #007bff;
    font-weight: bold;
    padding-left: 5px;
    border-radius: 3px;
}
</style>
