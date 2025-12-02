<template>
    <div class="pcb-table-container">
        <table class="pcb-table">
            <colgroup>
                <col style="width: 50px"> <!-- 번호 -->
                <col style="width: 159px"> <!-- 제품사진 -->
                <col style="width: 550px"> <!-- 제품명 -->
                <col style="width: 500px"> <!-- 가격 -->
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <div class="flex items-center justify-center gap-2" v-if="hasCheckbox">
                            <input type="checkbox" class="w-4 h-4 rounded border-gray-300" v-model="selectAllValue"
                                @change="toggleAll">
                            번호
                        </div>
                        <div v-else>번호</div>
                    </th>
                    <th>제품사진</th>
                    <th>제품명</th>
                    <th>가격</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(product, index) in pcbItems" :key="index">
                    <template v-if="product.is_pcb || product.parts">
                        <tr :class="{ 'bg-red-100': !product.parts }">
                            <td class="number-cell">
                                <div class="flex items-center justify-start gap-2" v-if="hasCheckbox">
                                    <input type="checkbox" class="w-4 h-4 rounded border-gray-300"
                                        v-model="product.selected" @change="updateSelectAll">
                                    <div>
                                        {{ index + 1 }}
                                        <span class="row-index" v-if="showRowIndex">({{ product.row_idx }})</span>
                                    </div>
                                </div>
                                <div v-else>{{ index + 1 }}</div>
                            </td>
                            <td class="image-cell">
                                <div v-if="product.parts?.serviceType === 'samplepcb' && (product.parts.size === 'AXIAL' || product.parts.size === 'DIP')" class="product-image">
                                    <img :src="`https://www.samplepcb.co.kr/img/pcb/${(product.parts.size || 'dip').toLowerCase()}.jpg`" :alt="product.part_number?.[0]">
                                </div>
                                <div v-else-if="product.parts?.photoUrl" class="product-image">
                                    <img :src="product.parts.photoUrl" :alt="product.part_number?.[0]">
                                </div>
                                <div v-else class="no-image">이미지 없음</div>
                            </td>
                            <td class="product-cell">
                                <div class="flex justify-between">
                                    <div class="product-name">{{ product.parts?.partName }}</div>
                                    <button v-if="showChangeButton" class="btn btn-outline-warning btn-sm btn-change" @click="handleChangeItem(product, index)">
                                        <i class="fas fa-exchange-alt"></i> 변경
                                    </button>
                                </div>
                                <div class="manufacturer">{{ product.parts?.manufacturerName }}</div>
                                <div class="description">{{ product.parts?.description }}</div>
                                <div class="categories">
                                    <span v-if="product.parts?.largeCategory" class="category">
                                        {{ product.parts.largeCategory }}
                                    </span>
                                    <span v-if="product.parts?.mediumCategory" class="category">
                                        {{ product.parts.mediumCategory }}
                                    </span>
                                    <span v-if="product.parts?.smallCategory" class="category">
                                        {{ product.parts.smallCategory }}
                                    </span>
                                </div>
                                <div class="mt-2 package-cell-alt">
                                    <div v-if="product.parts?.packaging?.field1 || product.parts?.packaging?.field2"
                                        class="package-info-alt">
                                        <div class="package-item-alt">
                                            <span v-if="product.parts?.packaging?.field1">
                                                {{ product.parts.packaging.field1 }}
                                            </span>
                                            <span v-if="product.parts?.packaging?.field2">
                                                {{ product.parts.packaging.field2 }}
                                            </span>
                                        </div>
                                    </div>
                                    <div v-else class="package-info-alt">
                                        <div class="package-item-alt">
                                            <span v-for="pkg in product.package" :key="pkg">
                                                {{ pkg }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <!-- 참조 정보 (분석 테이블에서만 표시) -->
                                <div v-if="showReference" class="reference">{{ product.reference_value }}</div>
                                <div v-if="showValues" class="categories">
                                    <span class="category" v-for="(valuesList, index) in product.values" :key="index">
                                        {{ valuesList?.value || '' }}
                                    </span>
                                </div>
                                <!-- 하이라이트 정보 (검색 결과에서만 표시) -->
                                <div v-if="showHighlights" class="mt-2 highlight-info" v-html="getHighlights(product.parts?.highlight)"></div>

                                <div class="debug">
                                    <div v-if="product.part_number_candidate" class="text-[10px] text-gray-600 mt-1 p-1 border border-gray-300 rounded">
                                        <div>ml_predicted_part_number: {{ product.ml_predicted_part_number }}</div>
                                        <div>ml_confidence: {{ product.ml_confidence }}</div>
                                        <div>part_number_candidate: {{ product.part_number_candidate }}</div>
                                        <div>search_value: {{ product.search_value }}</div>
                                        <div>value: {{ product.value }}</div>
                                        <div>is_pcb: {{ product.is_pcb }}</div>
                                        <div>search - {{ (product as any).search_source }} : {{ (product as any).search_term }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="price-cell">
                                <div v-if="product.parts?.prices?.length" class="price-info-alt space-x-2">
                                    <div class="px-3 py-1 border border-gray-300 mb-1">
                                        <select class="form-select" @change="updateQtyFromSelect(product, null, $event)">
                                            <option value="">패키지 선택</option>
                                            <option v-for="(price, pIndex) in getPriceOptions(product)" :key="pIndex"
                                                :data-index="pIndex" :value="getPriceSteps(price)">
                                                {{ price.pkg }} {{ getPriceSteps(price) }}개 이상
                                            </option>
                                        </select>
                                    </div>
                                    <div v-for="(price, pIndex) in product.parts.prices" :key="pIndex" class="price-tier"
                                        v-show="!product.selectedPrice?.pkg || product.selectedPrice?.pkg === price.pkg">
                                        <div class="package-item">
                                            <span class="package-type">{{ price.pkg }}</span>
                                            <span class="moq">MOQ: {{ price.moq }}</span>
                                            <span class="stock">재고: {{ price.stock }}</span>
                                        </div>
                                        <div class="price-steps">
                                            <div v-for="(step, sIndex) in price.priceSteps" :key="sIndex"
                                                :class="['step', { 'active-price-range-alt': isActiveRange(product, price, step) }]">
                                                {{ step.breakQuantity }}개 이상:
                                                <template v-if="isEditMode">
                                                    <input type="number" v-model.number="step.unitPrice"
                                                        class="w-24 px-2 py-1 border rounded" min="0"
                                                        @input="updatePriceStep(product, price, step)" />
                                                </template>
                                                <template v-else>
                                                    {{ step.unitPrice }}원
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else-if="product.parts?.price1" class="price-info">
                                    <div class="price-tier">
                                        <div class="package-item">
                                            <span class="package-type">
                                                {{ product.parts.partsPackaging || 'Cut Tape (CT)' }}</span>
                                            <span class="moq">MOQ: {{ product.parts.moq || 1 }}</span>
                                            <span class="stock">재고: 보유</span>
                                        </div>
                                        <div class="price-steps">
                                            <div
                                                :class="['step', { 'active-price-range-alt': isActiveSingleRange(product) }]">
                                                1개 이상 :
                                                <template v-if="isEditMode">
                                                    <input type="number" v-model.number="product.parts.price1"
                                                        class="w-24 px-2 py-1 border rounded" min="0"
                                                        @input="updateSinglePrice(product)" />
                                                </template>
                                                <template v-else>
                                                    {{ product.parts?.price1 }}원
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>가격 정보 없음</div>
                                <div v-if="product.parts?.prices?.length || product.parts?.price1"
                                    class="quantity-input mt-1 flex items-center gap-2">
                                    <input type="number" placeholder="수량 입력" :value="product.selectedPrice?.qty || ''"
                                        @input="e => updateQty(product, e)" min="1" class="w-24 px-2 py-1 border rounded" />
                                    <div v-if="product.selectedPrice" class="text-sm">
                                        <div class="text-gray-600">
                                            {{ product.selectedPrice.pkg }} /
                                            {{ getPriceSteps(product.selectedPrice) }}개 이상
                                        </div>
                                        <div v-if="isUnderMoq(product)" class="text-red-500 text-xs">
                                            최소수량부족 (MOQ: {{ getMoq(product) }}개)
                                        </div>
                                        <div class="font-medium">
                                            {{ formatPrice(getCalculatedPrice(product)) }}원
                                        </div>
                                    </div>
                                    <button v-if="showCartButton" class="btn btn-outline-primary" @click="handleAddToCart(product)">
                                        <i class="fas fa-shopping-cart"></i> 장바구니
                                    </button>
                                    <button v-if="showSelectButton" class="btn btn-outline-success" @click="handleSelectItem(product)">
                                        <i class="fas fa-check"></i> 선택
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr class="text-gray-600 bg-gray-50">
                            <td class="number-cell" colspan="">
                                <div class="flex items-center justify-start gap-2 " v-if="hasCheckbox">
                                    <input type="checkbox" class="w-4 h-4 rounded border-gray-300"
                                        v-model="product.selected" @change="updateSelectAll">
                                    <div>
                                        {{ index + 1 }}
                                        <span class="row-index" v-if="showRowIndex">({{ product.row_idx }})</span>
                                    </div>
                                </div>
                                <div v-else>{{ index + 1 }}</div>
                            </td>
                            <td class="product-cell" colspan="3">
                                <div class="flex justify-between">
                                    <div class="product-name">not pcb</div>
                                    <button v-if="showChangeButton" class="btn btn-outline-warning btn-sm btn-change" @click="handleChangeItem(product, index)">
                                        <i class="fas fa-exchange-alt"></i> 변경
                                    </button>
                                </div>
                                <div class="debug">
                                    <div v-if="product.part_number_candidate" class="text-[10px] text-gray-600 mt-1 p-1 border border-gray-300 rounded">
                                        <div>part_number_candidate: {{ product.part_number_candidate }}</div>
                                        <div>search_value: {{ product.search_value }}</div>
                                        <div>value: {{ product.value }}</div>
                                        <div>is_pcb: {{ product.is_pcb }}</div>
                                        <div>search - {{ (product as any).search_source }} : {{ (product as any).search_term }}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PcbItem, Price } from "@/model/sp-smart-bom-params";
import { useAnalysisTableComposable } from '@/composables/useAnalysisTable';

export default defineComponent({
    name: 'ProductTable',
    props: {
        pcbItems: {
            type: Array as () => (PcbItem & { selected?: boolean })[],
            required: true
        },
        selectAll: {
            type: Boolean,
            default: false
        },
        isEditMode: {
            type: Boolean,
            default: false
        },
        hasCheckbox: {
            type: Boolean,
            default: false
        },
        showRowIndex: {
            type: Boolean,
            default: false
        },
        showReference: {
            type: Boolean,
            default: false
        },
        showValues: {
            type: Boolean,
            default: false
        },
        showHighlights: {
            type: Boolean,
            default: false
        },
        showCartButton: {
            type: Boolean,
            default: false
        },
        showChangeButton: {
            type: Boolean,
            default: false
        },
        showSelectButton: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:selectAll', 'update:pcbItems', 'addToCart', 'changeItem', 'selectItem'],
    setup(props, { emit }) {
        const tableComposable = useAnalysisTableComposable.setup(props, emit);

        const getHighlights = (highlight: any) => {
            if (!highlight) return '';
            return Object.entries(highlight)
                .map(([key, value]) => {
                    const cleanKey = key.split('.')[0];
                    const cleanValue = Array.isArray(value)
                        ? value[0].replace(/<\/?em>/g, '')
                        : String(value).replace(/<\/?em>/g, '');
                    return `${cleanKey} : ${cleanValue}`;
                })
                .join(', ');
        };

        const handleAddToCart = (product: PcbItem) => {
            emit('addToCart', product);
        };

        const handleChangeItem = (product: PcbItem, index: number) => {
            emit('changeItem', product, index);
        };

        const handleSelectItem = (product: PcbItem) => {
            emit('selectItem', product);
        };

        const getPriceSteps = (price: any) => {
            return price?.priceSteps?.[0]?.breakQuantity || 1;
        };

        const hasPriceSteps = (price: any) => {
            return price?.priceSteps?.length > 0;
        };

        const getPriceOptions = (product: PcbItem) => {
            return product.parts?.prices?.filter(price => hasPriceSteps(price)) || [];
        };

        return {
            ...tableComposable,
            getHighlights,
            handleAddToCart,
            handleChangeItem,
            handleSelectItem,
            getPriceSteps,
            hasPriceSteps,
            getPriceOptions
        };
    }
});
</script>

<style lang="scss" scoped>
.package-item-alt {
    display: flex;
    gap: 5px;
    font-size: 0.9em;
}

.price-info-alt {
    flex-wrap: wrap;
    gap: 10px;

    .price-tier {
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        flex: 1;
        min-width: 200px;

        &:last-child {
            margin-bottom: 0;
        }

        .price-steps {
            display: flex;
            flex-wrap: wrap;
            font-size: 13px;

            .step {
                font-size: 0.9em;
                padding: 0.2rem 0.5rem;
                color: #495057;
                white-space: nowrap;
                margin-bottom: 5px;

                @media screen and (min-width: 768px) {
                    .price-tier:has(.price-steps .step:nth-child(n+6)) & {
                        flex: 0 1 auto;
                    }
                }
            }
        }
    }
}

.active-price-range-alt {
    background-color: rgba(72, 187, 120, 0.1);
    border-left: 3px solid #48bb78;
    font-weight: bold;
    padding-left: 5px;
    border-radius: 3px;
}

.btn-change {
    white-space: nowrap;
    margin-left: 8px;
}
</style>
