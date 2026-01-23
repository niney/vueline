<template>
    <div class="sp-smart-bom-detail">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>부품 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
            <p class="error-message">{{ error }}</p>
            <button @click="fetchPartData" class="btn-retry">다시 시도</button>
        </div>

        <!-- 데이터 표시 -->
        <div v-else-if="partData" class="part-detail">
            <!-- 헤더 영역 -->
            <div class="part-header">
                <div class="part-image">
                    <img v-if="partData.photoUrl" :src="partData.photoUrl" :alt="partData.partName" />
                    <div v-else class="no-image">이미지 없음</div>
                </div>
                <div class="part-info">
                    <h1 class="part-name">{{ partData.partName }}</h1>
                    <p class="part-description">{{ partData.description }}</p>
                    <div class="part-meta">
                        <span class="manufacturer">{{ partData.manufacturerName }}</span>
                        <span class="category">{{ partData.largeCategory }} > {{ partData.mediumCategory }}</span>
                    </div>
                </div>
            </div>

            <!-- 기본 정보 -->
            <div class="section">
                <h2 class="section-title">기본 정보</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">부품번호</span>
                        <span class="value">{{ partData.partName }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">제조사</span>
                        <span class="value">{{ partData.manufacturerName }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">대분류</span>
                        <span class="value">{{ partData.largeCategory }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">중분류</span>
                        <span class="value">{{ partData.mediumCategory }}</span>
                    </div>
                    <div class="info-item" v-if="partData.size">
                        <span class="label">크기</span>
                        <span class="value">{{ partData.size }}</span>
                    </div>
                    <div class="info-item" v-if="partData.temperature">
                        <span class="label">온도 범위</span>
                        <span class="value">{{ partData.temperature }}</span>
                    </div>
                </div>
            </div>

            <!-- 패키지 정보 -->
            <div class="section" v-if="partData.packaging">
                <h2 class="section-title">패키지 정보</h2>
                <div class="info-grid">
                    <div class="info-item" v-if="partData.packaging.field1">
                        <span class="label">패키지</span>
                        <span class="value">{{ partData.packaging.field1 }}</span>
                    </div>
                    <div class="info-item" v-if="partData.packaging.field2">
                        <span class="label">메트릭</span>
                        <span class="value">{{ partData.packaging.field2 }}</span>
                    </div>
                    <div class="info-item" v-if="partData.packaging.field3">
                        <span class="label">크기(mil)</span>
                        <span class="value">{{ partData.packaging.field3 }}</span>
                    </div>
                    <div class="info-item" v-if="partData.packaging.field4">
                        <span class="label">크기(mm)</span>
                        <span class="value">{{ partData.packaging.field4 }}</span>
                    </div>
                </div>
            </div>

            <!-- 가격 정보 -->
            <div class="section" v-if="partData.prices && partData.prices.length > 0">
                <h2 class="section-title">가격 정보</h2>
                <div class="price-tables">
                    <div v-for="(price, index) in partData.prices" :key="index" class="price-table-wrapper">
                        <h3 class="price-pkg">{{ price.pkg }}</h3>
                        <div class="price-meta">
                            <span>SKU: {{ price.sku }}</span>
                            <span>재고: {{ formatNumber(price.stock) }}</span>
                            <span>MOQ: {{ formatNumber(price.moq) }}</span>
                        </div>
                        <table class="price-table">
                            <thead>
                                <tr>
                                    <th>수량</th>
                                    <th>단가</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(step, stepIndex) in price.priceSteps" :key="stepIndex">
                                    <td>{{ formatNumber(step.breakQuantity) }}+</td>
                                    <td>₩{{ formatNumber(step.unitPrice) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 기본 가격 (prices가 없는 경우) -->
            <div class="section" v-else-if="partData.price">
                <h2 class="section-title">가격 정보</h2>
                <div class="basic-price">
                    <span class="price-label">기본가</span>
                    <span class="price-value">₩{{ formatNumber(partData.price) }}</span>
                </div>
            </div>
        </div>

        <!-- 데이터 없음 -->
        <div v-else class="no-data">
            <p>부품 정보가 없습니다.</p>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {Part, SpSmartBomDetailParams} from '@/model/sp-smart-bom-params';

export default defineComponent({
    name: 'SpSmartBomDetail',
    props: {
        params: {
            type: Object as () => SpSmartBomDetailParams,
            required: true
        }
    },
    data() {
        return {
            isLoading: false,
            error: null as string | null,
            partData: null as Part | null
        };
    },
    mounted() {
        this.fetchPartData();
    },
    methods: {
        async fetchPartData() {
            if (!this.params.partId) {
                this.error = '부품 ID가 지정되지 않았습니다.';
                return;
            }

            this.isLoading = true;
            this.error = null;

            try {
                const url = `${this.params.searchServerUrl}/pcbParts/_searchById?id=${encodeURIComponent(this.params.partId)}`;
                const response = await fetch(url);
                const result = await response.json();

                if (result.result && result.data) {
                    this.partData = result.data;
                } else {
                    this.error = result.message || '부품 정보를 찾을 수 없습니다.';
                }
            } catch (e) {
                console.error('부품 정보 조회 실패:', e);
                this.error = '부품 정보를 불러오는데 실패했습니다.';
            } finally {
                this.isLoading = false;
            }
        },
        formatNumber(value: number | null | undefined): string {
            if (value === null || value === undefined) return '-';
            return new Intl.NumberFormat('ko-KR').format(value);
        }
    }
});
</script>

<style lang="scss" scoped>
.sp-smart-bom-detail {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;

    .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    p {
        margin-top: 15px;
        color: #666;
    }
}

.error-container {
    text-align: center;
    padding: 40px;

    .error-message {
        color: #e74c3c;
        margin-bottom: 20px;
    }

    .btn-retry {
        padding: 10px 20px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
            background: #2980b9;
        }
    }
}

.part-detail {
    .part-header {
        display: flex;
        gap: 30px;
        margin-bottom: 30px;
        padding-bottom: 30px;
        border-bottom: 1px solid #eee;

        .part-image {
            flex-shrink: 0;
            width: 200px;
            height: 200px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;

            img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }

            .no-image {
                color: #999;
                font-size: 14px;
            }
        }

        .part-info {
            flex: 1;

            .part-name {
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 10px 0;
                color: #333;
            }

            .part-description {
                font-size: 16px;
                color: #666;
                margin: 0 0 15px 0;
            }

            .part-meta {
                display: flex;
                gap: 20px;
                font-size: 14px;
                color: #888;

                .manufacturer {
                    font-weight: 500;
                    color: #3498db;
                }
            }
        }
    }

    .section {
        margin-bottom: 30px;

        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
            color: #333;
        }
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            background: #f9f9f9;
            border-radius: 4px;

            .label {
                color: #666;
                font-size: 14px;
            }

            .value {
                font-weight: 500;
                color: #333;
            }
        }
    }

    .price-tables {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;

        .price-table-wrapper {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;

            .price-pkg {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 10px 0;
                color: #333;
            }

            .price-meta {
                display: flex;
                gap: 15px;
                font-size: 12px;
                color: #666;
                margin-bottom: 15px;
            }

            .price-table {
                width: 100%;
                border-collapse: collapse;

                th, td {
                    padding: 8px 12px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }

                th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #555;
                }

                td {
                    color: #333;
                }

                tbody tr:hover {
                    background: #f9f9f9;
                }
            }
        }
    }

    .basic-price {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: #f9f9f9;
        border-radius: 8px;

        .price-label {
            font-size: 16px;
            color: #666;
        }

        .price-value {
            font-size: 24px;
            font-weight: bold;
            color: #e74c3c;
        }
    }
}

.no-data {
    text-align: center;
    padding: 60px;
    color: #999;
}
</style>
