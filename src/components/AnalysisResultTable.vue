<template>
    <div class="pcb-table-container px-5">
        <table class="pcb-table">
            <colgroup>
                <col style="width: 80px"> <!-- 번호 -->
                <col style="width: 25%"> <!-- 업로드 데이터 -->
                <col style="width: 120px"> <!-- 제품사진 -->
                <col style="width: 30%"> <!-- 제품명 -->
                <col style="width: 10%"> <!-- 패키지/정보 -->
                <col style="width: calc(35% - 200px)"> <!-- 판매가격/수량선택 -->
            </colgroup>
            <thead>
            <tr>
                <th>
                    <div class="flex items-center justify-center gap-2">
                        <input
                            type="checkbox"
                            class="w-4 h-4 rounded border-gray-300"
                            v-model="selectAllValue"
                            @change="toggleAll"
                        >
                        번호
                    </div>
                </th>
                <th>업로드 데이터</th>
                <th>제품사진</th>
                <th>제품명</th>
                <th>패키지/정보</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="(product, index) in pcbItems" :key="index">
                <tr :class="{'bg-red-50': !product.parts, 'bg-blue-50': index % 2 === 0 && product.parts}">
                    <td class="number-cell" rowspan="2">
                        <div class="flex items-center justify-start gap-2">
                            <input
                                type="checkbox"
                                class="w-4 h-4 rounded border-gray-300"
                                v-model="product.selected"
                                @change="updateSelectAll"
                            >
                            <div>
                                {{ index + 1 }}
                                <span class="row-index">({{ product.row_idx }})</span>
                            </div>
                        </div>
                    </td>
                    <td class="product-cell">
                        <div class="description">
                            {{ product.part_number_candidate.slice(0, 3).join(', ') }}
                        </div>
                        <div class="reference">{{ product.reference_value }}</div>
                        <div class="categories">
                    <span class="category" v-for="(valuesList, index) in product.values" :key="index">
                        {{ valuesList?.value || '' }}
                    </span>
                        </div>
                    </td>
                    <td class="image-cell">
                        <div v-if="product.parts?.photoUrl" class="product-image">
                            <img :src="product.parts.photoUrl" :alt="product.part_number?.[0]">
                        </div>
                        <div v-else class="no-image">이미지 없음</div>
                    </td>
                    <td class="product-cell">
                        <div class="product-name">{{ product.part_number?.[0] }}</div>
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
                    </td>
                    <td class="package-cell">
                        <div v-if="product.parts?.packaging?.field1 || product.parts?.packaging?.field2" class="package-info">
                            <div class="package-item">
                                <span v-if="product.parts?.packaging?.field2">{{ product.parts.packaging.field1 }}</span>
                                <span v-if="product.parts?.packaging?.field2">{{ product.parts.packaging.field2 }}</span>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr :class="{'bg-red-50': !product.parts, 'bg-blue-50': index % 2 === 0 && product.parts}">
                    <td class="price-cell" colspan="4">
                        <div v-if="product.parts?.prices?.length" class="price-info space-x-2">
                            <div
                                v-for="(price, pIndex) in product.parts.prices"
                                :key="pIndex"
                                class="price-tier">
                                <div class="package-item">
                                    <span class="package-type">{{ price.pkg }}</span>
                                    <span class="moq">MOQ: {{ price.moq }}</span>
                                    <span class="stock">재고: {{ price.stock }}</span>
                                </div>
                                <div class="price-steps">
                                    <div
                                        v-for="(step, sIndex) in price.priceSteps"
                                        :key="sIndex"
                                        :class="['step', {'active-price-range': isActiveRange(product, price, step)}]">
                                        {{ step.breakQuantity }}개 이상:
                                        <template v-if="isEditMode">
                                            <input
                                                type="number"
                                                v-model.number="step.unitPrice"
                                                class="w-24 px-2 py-1 border rounded"
                                                min="0"
                                                @input="updatePriceStep(product, price, step)"
                                            />
                                        </template>
                                        <template v-else>
                                            {{ step.unitPrice }}원
                                        </template>
                                    </div>
                                </div>
                                <div class="quantity-select">
                                    <select class="form-select" @change="updateQtyFromSelect(product, price, $event)">
                                        <option value="">수량 선택</option>
                                        <option v-for="step in price.priceSteps"
                                                :key="step.breakQuantity"
                                                :value="step.breakQuantity">
                                            {{ step.breakQuantity }}개 이상
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="product.parts?.price1" class="price-info">
                            <div class="price-tier">
                                <div class="package-item">
                        <span class="package-type">
                            {{ product.parts.partsPackaging || 'Cut Tape (CT)' }}
                        </span>
                                    <span class="moq">MOQ: {{ product.parts.moq || 1 }}</span>
                                    <span class="stock">재고: 보유</span>
                                </div>
                                <div class="price-steps">
                                    <div :class="['step', {'active-price-range': isActiveSingleRange(product)}]">
                                        1개 이상 :
                                        <template v-if="isEditMode">
                                            <input
                                                type="number"
                                                v-model.number="product.parts.price1"
                                                class="w-24 px-2 py-1 border rounded"
                                                min="0"
                                                @input="updateSinglePrice(product)"
                                            />
                                        </template>
                                        <template v-else>
                                            {{ product.parts?.price1 }}원
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>가격 정보 없음</div>
                        <div v-if="product.parts?.prices?.length || product.parts?.price1" class="quantity-input mt-1 flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="수량 입력"
                                :value="product.selectedPrice?.qty || ''"
                                @input="e => updateQty(product, e)"
                                min="1"
                                class="w-24 px-2 py-1 border rounded"
                            />
                            <div v-if="product.selectedPrice" class="text-sm">
                                <div class="text-gray-600">
                                    {{ product.selectedPrice.pkg }} /
                                    {{ product.selectedPrice.breakQuantity }}개 이상
                                </div>
                                <div v-if="isUnderMoq(product)" class="text-red-500 text-xs">
                                    최소수량부족 (MOQ: {{ getMoq(product) }}개)
                                </div>
                                <div class="font-medium">
                                    {{ formatPrice(getCalculatedPrice(product)) }}원
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAnalysisTableComposable } from '@/composables/useAnalysisTable';

export default defineComponent({
    name: 'AnalysisResultTable',
    props: useAnalysisTableComposable.props,
    emits: ['update:selectAll', 'update:pcbItems'],
    setup(props, { emit }) {
        return useAnalysisTableComposable.setup(props, emit);
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