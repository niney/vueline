<template>
    <div class="flex-1 overflow-auto">
        <table class="admin-result-table">
            <thead>
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            class="custom-checkbox"
                            :checked="isAllSelected"
                            @change="$emit('toggle-select-all')"
                        />
                    </th>
                    <th>LINE</th>
                    <th>DESIGNATOR</th>
                    <th>QTY</th>
                    <th>MPN</th>
                    <th>MANUFACTURER</th>
                    <th>PKG</th>
                    <th>MOQ</th>
                    <th class="text-right">원가</th>
                    <th class="text-right">마진율</th>
                    <th class="text-right">판매가</th>
                    <th class="text-right">소계</th>
                    <th>MATCH</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in pcbItemList" :key="index">
                    <td>
                        <input
                            type="checkbox"
                            class="custom-checkbox"
                            :checked="selectedRows.has(index)"
                            :disabled="item.is_pcb !== true"
                            @change="$emit('toggle-select', index)"
                        />
                    </td>
                    <td>{{ index + 1 }}</td>
                    <td>{{ getDesignator(item) }}</td>

                    <!-- QTY 편집 -->
                    <td @click.stop>
                        <NumberInput
                            v-if="item.is_pcb && item.parts"
                            :model-value="item.selectedPrice?.qty || item.qty || 1"
                            :min="1"
                            :dark-mode="darkMode"
                            @update:model-value="handleQtyUpdate(item, index, $event)"
                        />
                        <span v-else>-</span>
                    </td>

                    <td>
                        <span v-if="item.parts">{{ item.parts.partName }}</span>
                        <span v-else class="text-gray-500">-</span>
                    </td>
                    <td>
                        <span v-if="item.parts" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ item.parts.manufacturerName }}</span>
                        <span v-else class="text-gray-500">-</span>
                    </td>

                    <!-- PKG 선택 -->
                    <td @click.stop>
                        <SelectBox
                            v-if="item.parts?.prices?.length"
                            :options="getSelectBoxOptions(item)"
                            :model-value="getSelectedPkgIndex(item)"
                            :dark-mode="darkMode"
                            :show-empty-option="true"
                            empty-option-label="선택"
                            @update:model-value="handlePkgSelect(item, index, $event)"
                        />
                        <span v-else-if="item.parts?.partsPackaging" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                            {{ item.parts.partsPackaging }}
                        </span>
                        <span v-else class="text-gray-500">-</span>
                    </td>

                    <td>
                        <template v-if="item.is_pcb && item.selectedPrice">{{ item.selectedPrice.moq }}</template>
                        <template v-else-if="item.parts?.moq">{{ item.parts.moq }}</template>
                        <template v-else>-</template>
                    </td>

                    <!-- 원가 -->
                    <td class="text-right tabular-nums">
                        <template v-if="item.is_pcb && getCostPrice(item) > 0">
                            {{ formatPrice(getCostPrice(item)) }}
                        </template>
                        <template v-else>-</template>
                    </td>

                    <!-- 마진율 -->
                    <td class="text-right tabular-nums">
                        <template v-if="item.is_pcb && item.priceOverride">
                            <span :class="getMarginColorClass(getMarginRate(item))">
                                {{ getMarginRate(item).toFixed(1) }}%
                            </span>
                        </template>
                        <template v-else-if="item.is_pcb && getCostPrice(item) > 0">
                            <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">0.0%</span>
                        </template>
                        <template v-else>-</template>
                    </td>

                    <!-- 판매가 (편집) -->
                    <td class="text-right" @click.stop>
                        <template v-if="item.is_pcb && getCostPrice(item) > 0">
                            <!-- 오버라이드 편집 모드 -->
                            <div v-if="editingPriceIndex === index" class="flex items-center justify-end gap-1">
                                <input
                                    ref="priceInputRef"
                                    type="number"
                                    class="inline-price-input"
                                    :class="darkMode
                                        ? 'bg-amber-500/10 border-amber-500/40 text-gray-200 focus:border-amber-400'
                                        : 'bg-amber-50 border-amber-300 text-gray-800 focus:border-amber-500'"
                                    :value="item.priceOverride?.unitPrice ?? getCostPrice(item)"
                                    min="0"
                                    @keyup.enter="confirmPriceEdit(item, index, $event)"
                                    @keyup.escape="cancelPriceEdit"
                                    @blur="confirmPriceEdit(item, index, $event)"
                                />
                            </div>
                            <!-- 오버라이드 적용된 상태 -->
                            <div v-else-if="item.priceOverride" class="flex items-center justify-end gap-1.5">
                                <span
                                    class="tabular-nums font-medium cursor-pointer"
                                    :class="darkMode ? 'text-amber-400' : 'text-amber-600'"
                                    @click="startPriceEdit(index)"
                                >{{ formatPrice(item.priceOverride.unitPrice) }}</span>
                                <button
                                    class="p-0 border-0 bg-transparent cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
                                    :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                                    title="원가로 되돌리기"
                                    @click="$emit('reset-price-override', index)"
                                >
                                    <i class="fas fa-undo text-[10px]"></i>
                                </button>
                            </div>
                            <!-- 기본 (원가 동일) -->
                            <div v-else class="flex items-center justify-end gap-1.5">
                                <span class="tabular-nums" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                                    {{ formatPrice(getCostPrice(item)) }}
                                </span>
                                <button
                                    class="p-0 border-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                                    :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                                    title="판매가 수정"
                                    @click="startPriceEdit(index)"
                                >
                                    <i class="fas fa-pen text-[10px]"></i>
                                </button>
                            </div>
                        </template>
                        <template v-else>-</template>
                    </td>

                    <!-- 소계 -->
                    <td class="text-right tabular-nums">
                        <template v-if="item.is_pcb && item.selectedPrice">
                            <span class="font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                {{ formatPrice(getRowTotal(item)) }}
                            </span>
                        </template>
                        <template v-else>-</template>
                    </td>

                    <td>
                        <template v-if="item.is_pcb">
                            <StatusBadge v-if="item.parts" label="Found" variant="success" />
                            <StatusBadge v-else label="Not Found" variant="error" />
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { PcbItem } from "@/model/sp-smart-bom-params";
import {
    formatPrice,
    getPriceOptions,
    getPriceSteps,
    updateItemQty,
    getCostPrice,
    getSalePrice,
    getMarginRate,
    applyPriceOverride
} from "../services";
import StatusBadge from "./StatusBadge.vue";
import SelectBox from "./SelectBox.vue";
import type { SelectOption } from "./SelectBox.vue";
import NumberInput from "./NumberInput.vue";

export default defineComponent({
    name: 'AdminBomTable',
    components: { StatusBadge, SelectBox, NumberInput },
    props: {
        pcbItemList: {
            type: Array as PropType<PcbItem[]>,
            required: true
        },
        darkMode: {
            type: Boolean,
            required: true
        },
        selectedRows: {
            type: Object as PropType<Set<number>>,
            required: true
        }
    },
    emits: ['toggle-select', 'toggle-select-all', 'update-qty', 'update-price-override', 'reset-price-override', 'update-package'],
    setup(props, { emit }) {
        const editingPriceIndex = ref<number | null>(null);

        const isAllSelected = computed(() => {
            const pcbIndices = props.pcbItemList
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.is_pcb === true)
                .map(({ idx }) => idx);
            if (pcbIndices.length === 0) return false;
            return pcbIndices.every(idx => props.selectedRows.has(idx));
        });

        const getDesignator = (item: PcbItem) => {
            return item.reference_prefix || item.number?.[0] || '-';
        };

        const getSelectBoxOptions = (item: PcbItem): SelectOption[] => {
            const prices = getPriceOptions(item);
            return prices.map((price, index) => ({
                value: `${index}`,
                label: `${price.pkg} ${getPriceSteps(price)}+`,
                data: price
            }));
        };

        const getSelectedPkgIndex = (item: PcbItem): string => {
            if (!item.selectedPrice?.pkg || !item.parts?.prices) return '';
            const prices = getPriceOptions(item);
            const index = prices.findIndex(p => p.pkg === item.selectedPrice?.pkg);
            return index >= 0 ? `${index}` : '';
        };

        const handlePkgSelect = (item: PcbItem, index: number, value: string) => {
            if (!value || !item.parts?.prices) return;
            const prices = getPriceOptions(item);
            const pIdx = parseInt(value);
            if (pIdx >= 0 && pIdx < prices.length) {
                const price = prices[pIdx];
                const step = price.priceSteps?.[0];
                const qty = step?.breakQuantity || price.moq || 1;
                item.selectedPrice = {
                    pkg: price.pkg,
                    breakQuantity: qty,
                    unitPrice: step?.unitPrice || 0,
                    qty: qty,
                    moq: price.moq,
                    stock: price.stock
                };
                // 패키지 변경 시 오버라이드 초기화
                item.priceOverride = undefined;
                emit('update-package', index);
            }
        };

        const handleQtyUpdate = (item: PcbItem, index: number, qty: number | string) => {
            const numQty = typeof qty === 'string' ? parseInt(qty) : qty;
            if (numQty > 0) {
                updateItemQty(item, numQty);
                emit('update-qty', index);
            }
        };

        const getRowTotal = (item: PcbItem): number => {
            if (!item.selectedPrice) return 0;
            const price = getSalePrice(item);
            return price * item.selectedPrice.qty;
        };

        const getMarginColorClass = (rate: number): string => {
            if (rate < 0) return 'text-red-500';
            if (rate < 10) return 'text-red-400';
            if (rate < 20) return 'text-amber-400';
            return 'text-emerald-400';
        };

        const startPriceEdit = (index: number) => {
            editingPriceIndex.value = index;
        };

        const confirmPriceEdit = (item: PcbItem, index: number, event: Event) => {
            const value = Number((event.target as HTMLInputElement).value);
            if (value > 0 && value !== getCostPrice(item)) {
                applyPriceOverride(item, value);
                emit('update-price-override', index);
            }
            editingPriceIndex.value = null;
        };

        const cancelPriceEdit = () => {
            editingPriceIndex.value = null;
        };

        return {
            isAllSelected,
            editingPriceIndex,
            getDesignator,
            getSelectBoxOptions,
            getSelectedPkgIndex,
            handlePkgSelect,
            handleQtyUpdate,
            getRowTotal,
            getMarginColorClass,
            startPriceEdit,
            confirmPriceEdit,
            cancelPriceEdit,
            formatPrice,
            getCostPrice,
            getSalePrice,
            getMarginRate
        };
    }
});
</script>
