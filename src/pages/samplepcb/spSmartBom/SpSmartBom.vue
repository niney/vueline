<template>
    <div class="bom-eye-bg">
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
                        <div class="filebox-area" @drop="dropUploadAnalysis($event);"
                             @dragover="dropOverUploadAnalysis($event);">
                            <div class="lds-roller-area" style="height: 100%">
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
                            </div>
                            <div class="right flex-1">
                                <p>{{loadingText}}</p>
                                <img src="https://www.samplepcb.co.kr/img/bom/upload_bk.png" style="margin-bottom: 10px;"/>
                                <p>Part Match in 30 Sec</p>
                            </div>
                            <div class="filebox bs3-primary flex-1">
                                <form name="upload_form" method="post" enctype="multipart/form-data" action="">
                                    <label for="bom_file" style="width: 225px;">Upload BOM File</label>
                                    <input type="file" id="bom_file" name="file" @change="uploadAnalysis()"/>
                                </form>
                                <div style="color: #a6b2c7;">엑셀파일만 업로드 가능</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="slide feat-list sub-message">
                    <div class="slide-box"><img src="//www.samplepcb.co.kr//img/bom/bom_feat1.png" alt="ai"/><span class="txt">AI 실시간검색</span><span
                        class="sub-txt">전 세계 재고현황</span></div>
                    <div class="slide-box"><img src="//www.samplepcb.co.kr/img/bom/bom_feat2.png" alt="1min"/><span
                        class="txt">1분 이내</span><span
                        class="sub-txt">검색소요시간</span></div>
                    <div class="slide-box"><img src="//www.samplepcb.co.kr/img/bom/bom_feat3.png" alt="search"/><span class="txt">일괄검색</span><span
                        class="sub-txt">BOM 파일(엑셀파일)</span></div>
                    <div class="slide-box"><img src="//www.samplepcb.co.kr/img/bom/bom_feat4.png" alt="dv"/><span
                        class="txt">빠른배송</span><span
                        class="sub-txt">평균 1~2주 이내</span></div>
                </div>
            </div>
        </div>
        <div class="search-box">
            <div class="search">
                <div class="title">단일검색</div>
                <div class="search-input">
                    <input type="text" id="tbPartNumber" placeholder="전자부품 번호(P/N)로 검색하세요!" v-model="searchQuery"
                           @keyup.enter="searchItems(searchQuery)">
                    <input type="submit" value="검색" @click="searchItems(searchQuery)">
                </div>
                <div class="search-right-btn">
                    <button class="btn-success-round" style="margin-right: 10px;"
                            onclick="location.href = '/shop/bom_sell.php'">파트너 등록
                    </button>
                    <button class="btn-success-round" onclick="location.href = '/shop/bom_sell.php'">과잉재고 등록</button>
                </div>
            </div>
        </div>
    </div><!-- bom-eye-bg -->
    <div>
        <!-- 검색 영역 -->
<!--        <div class="search-area">
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Search..."
                @keyup.enter="searchItems"
                class="search-input"
            />
            <button @click="searchItems" class="search-button">
                Search
            </button>
        </div>-->

        <!-- 검색 결과 표시 -->
<!--        <div v-if="searchResults.length > 0" class="search-results">
            <h3>검색 결과:</h3>
            <div v-for="(result, index) in searchResults" :key="index" class="result-item">
                <h4>{{ result.partName }}</h4>
                <p><strong>제조사:</strong> {{ result.manufacturerName }}</p>
                <p><strong>설명:</strong> {{ result.description }}</p>
                <p><strong>대분류:</strong> {{ result.largeCategory }}</p>
                <p><strong>중분류:</strong> {{ result.mediumCategory }}</p>
                <p><strong>가격:</strong> {{ result.price1 }}</p>
                <p v-if="result.highlight">
                    <strong>일치 항목:</strong>
                    <span v-html="getHighlights(result.highlight)"></span>
                </p>
            </div>
        </div>-->

        <!-- 로딩 표시 -->
        <div v-if="isLoading" style="margin-top: 10px;">로딩중...</div>

        <!-- 기존 코드 유지 -->
        <!-- 파일 업로드 폼 -->
<!--        <form id="fileUploadForm" @submit.prevent="uploadFile">
            <input type="file" id="fileInput" name="file" @change="fileChanged"/>
            <button type="submit">Upload</button>
        </form>
        <div style="margin-top: 10px;">헤더의 위치 : {{ data.headerColumnIdx + 1 }}</div>-->
        <!-- 이하 생략 -->
    </div>

    <div class="p-6 bg-gray-100">
        <!-- Section Titles -->
        <div class="flex bg-white shadow-md rounded-t-lg p-4 font-semibold text-gray-700">
            <div class="w-1/6 text-center">제품 사진</div>
            <div class="w-2/6 text-center">제품명</div>
            <div class="w-1/6 text-center">RoHS/패키지 정보</div>
            <div class="w-1/6 text-center">판매 가격</div>
            <div class="w-1/6 text-center">액션</div>
        </div>

        <!-- Product Cards -->
        <div v-for="(product, index) in searchResults" :key="index" class="bg-white shadow-md border-t p-4 flex">
            <!-- Product Image -->
            <div class="w-1/6 flex justify-center items-center">
                <img :src="product.image ? product.image : 'https://assets.lcsc.com/images/lcsc/900x900/20230201_DMBJ-RVT1A101M0505_C970683_front.jpg'"
                     alt="Product Image" class="w-20 h-20 object-contain"/>
            </div>

            <!-- Product Details -->
            <div class="w-2/6 px-4">
                <h4>{{ product.largeCategory }} > {{ product.mediumCategory }} > {{ product.smallCategory }}</h4>
                <h3 class="font-bold text-gray-800">[{{ product.manufacturerName }}] {{ product.partName }}</h3>
                <p class="text-sm text-gray-500">{{ product.description }}</p>
                <span v-html="getHighlights(product.highlight)"></span>
            </div>

            <!-- RoHS/Package Info -->
            <div class="w-1/6 flex flex-col items-center justify-center">
                <span class="text-xs text-gray-500">{{ product.packaging }}</span>
            </div>

            <!-- Pricing -->
            <div class="w-1/6 flex flex-col justify-center items-center">
                <p class="font-bold text-lg text-gray-900">{{ product.price1 }}원</p>
                <p class="text-xs text-gray-500">1개~ {{ product.price2 }}원</p>
                <p class="text-xs text-gray-500">10개~ {{ product.price3 }}원</p>
                <p class="text-xs text-gray-500">100~ {{ product.price4 }}원</p>
                <p class="text-xs text-gray-500">1000~ {{ product.price5 }}원</p>
            </div>

            <!-- Actions -->
            <div class="w-1/6 flex flex-col items-center justify-center">
                <button class="mb-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">장바구니</button>
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded">대량구매 견적</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {VueCommonParams} from "@/model/vue-common-params";
import '@/tailwind.css';

let that: any;
export default defineComponent({
    name: 'SpSmartBom',
    props: {
        params: {
            type: Object as () => VueCommonParams,
            required: true
        }
    },
    data() {
        return {
            that: {},
            searchQuery: '',
            selectedFile: null,
            data: {} as any,
            isLoading: false,
            searchResults: [] as any[],
            products: [
                {
                    image: "path/to/image1.png",
                    name: "[MOLEX] 146153-0050",
                    spec: "2.4/5G dual band Flex×50mm assy",
                    rohs: "EPY36J6T",
                    package: "M.O.Q: 32",
                    price: "2,318.18",
                    quantityRange: "1개 ~"
                },
                {
                    image: "path/to/image2.png",
                    name: "[MOLEX] 146153-0050",
                    spec: "2.4/5G dual band Flex×50mm assy",
                    rohs: "EPY36J4P",
                    package: "M.O.Q: 5",
                    price: "2,927.27",
                    quantityRange: "1개 ~"
                },
                {
                    image: "path/to/image3.png",
                    name: "[MOLEX] 146153-0050",
                    spec: "ANTENNA, WIFI, 4.9 TO 5.93GHZ, 4.25DBI",
                    rohs: "EPXVR4VL",
                    package: "RoHS",
                    price: "3,209.09",
                    quantityRange: "1개 ~"
                }
            ]
        }
    },
    beforeCreate() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        that = this;
    },
    methods: {
        fileChanged(event: any) {
            this.selectedFile = event.target.files[0];
        },
        uploadFile() {
            // 기존 코드 유지
        },
        searchItems() {
            if (!this.searchQuery.trim()) {
                alert('검색어를 입력해주세요.');
                return;
            }

            this.isLoading = true;
            this.searchResults = [];

            $.ajax({
                url: 'http://localhost:8081/api/pcbParts/_search',
                type: 'GET',
                data: {
                    q: this.searchQuery,
                    qf: 'parsing'
                },
                success: (response) => {
                    if (response.result && response.data) {
                        this.searchResults = response.data;
                    } else {
                        this.searchResults = [];
                    }
                    this.isLoading = false;

                    if (this.searchResults.length === 0) {
                        alert('검색 결과가 없습니다.');
                    }
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
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        },
        targetToStr(target: number) {
            // 기존 코드 유지
        },
        // 기타 기존 메서드들 유지
    }
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/btn.scss";

@font-face {
    font-family: 'GmarketSansLight';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansLight.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'GmarketSansBold';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

// Background image for specific section
.bom-eye-bg {
    background: url("https://www.samplepcb.co.kr/img/bom/bom_intro_bg.png") no-repeat center center;
}

.section {
    // Section with background image for analysis
    &.analysis-section {
        background: url("https://www.samplepcb.co.kr/img/bom/bom_top_ext_bg.png");
    }

    // Centered container for intro
    .intro {
        width: 1250px;
        margin: 0 auto;
    }

    .slide {
        display: flex;

        .message {
            // Main message style
            font: 30px GmarketSansBold;
            color: white;

            strong {
                // Strong tag styling within message
                font: 30px GmarketSansBold;
            }
        }

        // Slide box container with centered alignment
        .slide-box {
            display: flex;
            align-items: center;
        }
    }

    // Common message section with margin
    .message {
        margin-top: 64px;

        .top {
            // Styling for the top section of the message
            font: 30px GmarketSansMedium;
        }
    }

    .sub-message {
        margin-top: 40px;
        font-weight: normal;
        color: white;
    }

    .feat-list {
        margin-top: 70px;
        padding-left: 10px;
        padding-bottom: 29px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        .txt {
            // Main text inside feature list
            margin-left: 15px;
            font-size: 18px;
        }

        .sub-txt {
            // Subtext styling within feature list
            margin-left: 18px;
            font-size: 14px;
            color: #dfeaff;
        }
    }
}

/* Input file container */
.filebox-container {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 67px;
}

.filebox-area {
    background: #FFFFFF;
    border: transparent;
    border-radius: 10px;
    text-align: center;
    display: flex;
    width: 679px;
    height: 196px;

    .right {
        // Align elements to the center within filebox-area
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
}

.filebox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    label {
        // File input button styling
        display: inline-block;
        padding: .5em .75em;
        color: #999;
        font-size: inherit;
        line-height: normal;
        vertical-align: middle;
        background-color: #fdfdfd;
        cursor: pointer;
        border: 1px solid #ebebeb;
        border-bottom-color: #e2e2e2;
        border-radius: .25em;
    }

    input[type="file"] {
        // Hide actual file input field
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    // Primary style for filebox button
    &.bs3-primary {
        label {
            color: #fff;
            background-color: #4264d0;
            border-color: #2e6da4;
            border-radius: 20px;
            height: 47px;
        }
    }

    // Success style for filebox button
    &.bs3-success {
        label {
            color: #fff;
            background-color: #5cb85c;
            border-color: #4cae4c;
        }
    }
}

.search-box {
    background: url("https://www.samplepcb.co.kr/img/bom/bom_search_bg.png");
    background-size: cover;
    overflow: auto;
}

.search {
    margin: 20px auto;
    width: 1250px;
    display: flex;
    justify-content: center;
    position: relative;
}

.search .title {
    color: #5185e5;
    font-size: 18px;
    margin: auto 10px auto 0;
}

.search .search-right-btn {
    position: absolute;
    right: 0;
    top: 14px;
}

/* 검색 입력 */
.search input[type=text],
.search input[type=submit] {
    border: none;
    border-radius: 0 40px 40px 0;
    /*border: 1px solid red;*/
    outline: none;
    box-sizing: border-box;
    /*box-shadow: 0 0 5px rgba(0, 0, 0, 0.17);*/
    height: 60px;
    vertical-align: middle;
    padding: 0 20px;
    font-size: 18px;
    line-height: 18px;
    background: #FFFFFF;
}

.search input[type=text]:focus {
    border: none !important;
}

.search input[type=text] {
    width: 490px;
    border-radius: 40px 0 0 40px;
    margin-right: -4px;
}

.search input[type=submit] {
    padding: 20px;
    cursor: pointer;
}

// Search bar area
/*.search-area {
    margin-top: 20px;
    display: flex;
    align-items: center;
    max-width: 500px;

    .search-input {
        // Style for the input field
        flex-grow: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px 0 0 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .search-button {
        // Style for the search button
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
            // Change background color on hover
            background-color: #2980b9;
        }
    }
}*/

// Search results container and item styling
.search-results {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;

    .result-item {
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #eee;
        border-radius: 4px;
    }
}

.product-card {
    .price {
        font-size: 1.1rem;
        color: #1f2937;
    }

    .actions {
        button {
            transition: background-color 0.3s ease;
        }
    }
}

</style>
