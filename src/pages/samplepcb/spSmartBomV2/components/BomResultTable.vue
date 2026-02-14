<template>
    <div class="flex-1 overflow-auto" :class="rightPanelOpen ? 'pr-80' : ''">
        <table class="result-table">
            <thead>
                <tr>
                    <th><input type="checkbox" class="custom-checkbox" /></th>
                    <th></th>
                    <th>LINE</th>
                    <th>DESIGNATOR</th>
                    <th>QTY</th>
                    <th>MPN / MANUFACTURER</th>
                    <th>MATCH</th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in pcbItemList" :key="index">
                    <tr class="cursor-pointer" @click="$emit('toggle-row', index)">
                        <td @click.stop>
                            <input
                                type="checkbox"
                                class="custom-checkbox"
                                :checked="selectedRows.has(index)"
                                :disabled="item.is_pcb !== true"
                                @change="$emit('toggle-select', index)"
                            />
                        </td>
                        <td>
                            <i
                                class="fas text-[10px] text-gray-400 cursor-pointer hover:text-white"
                                :class="expandedRows.has(index) ? 'fa-chevron-down' : 'fa-chevron-right'"
                            ></i>
                        </td>
                        <td>{{ index + 1 }}</td>
                        <td>{{ getDesignator(item) }}</td>
                        <td>{{ item.is_pcb ? (item.qty || 1) : '-' }}</td>
                        <td>
                            <div v-if="item.parts">
                                {{ item.parts.partName }}
                                <small class="block mt-1 text-gray-400">{{ item.parts.manufacturerName }}</small>
                            </div>
                            <div v-else-if="!item.is_pcb"></div>
                            <div v-else class="text-gray-400">
                                —<br><small>Unknown</small>
                            </div>
                        </td>
                        <td>
                            <template v-if="item.is_pcb">
                                <StatusBadge
                                    v-if="item.parts"
                                    label="Found"
                                    variant="success"
                                />
                                <StatusBadge
                                    v-else
                                    label="Not Found"
                                    variant="error"
                                />
                            </template>
                        </td>
                    </tr>
                    <!-- 확장 상세 영역 -->
                    <tr v-if="expandedRows.has(index)" :class="darkMode ? 'bg-[#141820]' : 'bg-slate-50'">
                        <td colspan="7" class="!p-0" :class="darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'">
                            <div class="flex gap-6 items-start p-5">
                                <div
                                    class="shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center"
                                    :class="darkMode ? 'bg-gray-800' : 'bg-gray-200'"
                                >
                                    <img
                                        v-if="item.parts?.serviceType === 'samplepcb' && (item.parts.size === 'AXIAL' || item.parts.size === 'DIP')"
                                        :src="`https://www.samplepcb.co.kr/img/pcb/${(item.parts.size || 'dip').toLowerCase()}.jpg`"
                                        :alt="item.parts?.partName"
                                        class="max-w-full max-h-full object-contain"
                                    />
                                    <img
                                        v-else-if="item.parts?.photoUrl"
                                        :src="item.parts.photoUrl"
                                        :alt="item.parts?.partName"
                                        class="max-w-full max-h-full object-contain"
                                    />
                                    <div v-else class="text-[11px] text-gray-500 text-center">No Image</div>
                                </div>
                                <div class="flex-1 flex flex-col gap-2 items-start text-left">
                                    <div class="text-sm" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                        {{ item.parts?.description || 'No description' }}
                                    </div>
                                    <div v-if="item.parts?.packaging?.field1 || item.parts?.packaging?.field2" class="text-[13px]" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                                        {{ item.parts?.packaging?.field1 || '' }} {{ item.parts?.packaging?.field2 || '' }}
                                    </div>
                                    <div v-if="item.reference_value" class="text-[13px]" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                                        {{ item.reference_value }}
                                    </div>
                                </div>
                                <!-- 가격 정보 영역 (오른쪽) -->
                                <div class="shrink-0 text-right">
                                    <div v-if="item.parts?.prices?.length" class="space-y-2">
                                        <!-- SelectBox + 수량 입력 + 계산된 가격 -->
                                        <div class="flex items-center justify-end gap-3 flex-nowrap">
                                            <SelectBox
                                                :options="getSelectBoxOptions(item)"
                                                :model-value="getSelectedPkgIndex(item)"
                                                placeholder="패키지 선택"
                                                :dark-mode="darkMode"
                                                :show-empty-option="true"
                                                empty-option-label="패키지 선택"
                                                @update:model-value="handlePkgSelect(item, $event)"
                                            />
                                            <NumberInput
                                                :model-value="item.selectedPrice?.qty || ''"
                                                placeholder="수량"
                                                :min="1"
                                                :dark-mode="darkMode"
                                                @update:model-value="updateQty(item, $event)"
                                            />
                                            <div v-if="item.selectedPrice" class="text-sm text-right">
                                                <div v-if="isUnderMoq(item)" class="text-red-500 text-xs">
                                                    MOQ: {{ getMoq(item) }}개
                                                </div>
                                                <div class="font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                                    {{ formatPrice(getCalculatedPrice(item)) }}원
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            v-for="(price, pIndex) in item.parts.prices"
                                            :key="pIndex"
                                            v-show="!item.selectedPrice?.pkg || item.selectedPrice?.pkg === price.pkg"
                                            class="text-sm"
                                        >
                                            <div class="flex justify-end gap-3 mb-1" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                                                <span>{{ price.pkg }}</span>
                                                <span>MOQ: {{ price.moq }}</span>
                                                <span>재고: {{ price.stock }}</span>
                                            </div>
                                            <div class="border-t mb-2" :class="darkMode ? 'border-gray-600' : 'border-gray-200'"></div>
                                            <div class="grid grid-cols-3 gap-x-4 gap-y-1">
                                                <div
                                                    v-for="(step, sIndex) in price.priceSteps"
                                                    :key="sIndex"
                                                    class="flex justify-end gap-1 whitespace-nowrap"
                                                    :class="[
                                                        isActiveRange(item, price, step)
                                                            ? 'text-blue-400 font-medium'
                                                            : darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    ]"
                                                >
                                                    <span>{{ step.breakQuantity }}개 이상:</span>
                                                    <span class="text-right">{{ formatPrice(step.unitPrice) }}원</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else-if="item.parts?.price1" class="space-y-2">
                                        <!-- 수량 입력 + 계산된 가격 -->
                                        <div class="flex items-center justify-end gap-3 flex-nowrap">
                                            <NumberInput
                                                :model-value="item.selectedPrice?.qty || ''"
                                                placeholder="수량"
                                                :min="1"
                                                :dark-mode="darkMode"
                                                @update:model-value="updateQty(item, $event)"
                                            />
                                            <div v-if="item.selectedPrice" class="text-sm text-right">
                                                <div v-if="isUnderMoq(item)" class="text-red-500 text-xs">
                                                    MOQ: {{ getMoq(item) }}개
                                                </div>
                                                <div class="font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                                    {{ formatPrice(getCalculatedPrice(item)) }}원
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-sm" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                                            <div class="flex justify-end gap-3 mb-1">
                                                <span>{{ item.parts.partsPackaging || 'Cut Tape (CT)' }}</span>
                                                <span>MOQ: {{ item.parts.moq || 1 }}</span>
                                                <span>재고: 보유</span>
                                            </div>
                                            <div
                                                class="flex justify-end gap-2"
                                                :class="isActiveSingleRange(item) ? 'text-blue-400 font-medium' : ''"
                                            >
                                                <span>1개 이상:</span>
                                                <span>{{ formatPrice(item.parts.price1) }}원</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                                        가격 정보 없음
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
import { defineComponent, PropType } from 'vue';
import { PcbItem } from "@/model/sp-smart-bom-params";
import {
    formatPrice,
    getPriceOptions,
    getPriceSteps,
    updateItemQty,
    isActiveRange,
    isActiveSingleRange,
    isUnderMoq,
    getMoq,
    getCalculatedPrice
} from "../services";
import StatusBadge from "./StatusBadge.vue";
import SelectBox from "./SelectBox.vue";
import type { SelectOption } from "./SelectBox.vue";
import NumberInput from "./NumberInput.vue";

export default defineComponent({
    name: 'BomResultTable',
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
        expandedRows: {
            type: Object as PropType<Set<number>>,
            required: true
        },
        selectedRows: {
            type: Object as PropType<Set<number>>,
            required: true
        },
        rightPanelOpen: {
            type: Boolean,
            required: true
        }
    },
    emits: ['toggle-row', 'toggle-select'],
    setup() {
        const getDesignator = (item: PcbItem) => {
            return item.reference_prefix || item.number?.[0] || '-';
        };

        const getSelectBoxOptions = (item: PcbItem): SelectOption[] => {
            const prices = getPriceOptions(item);
            return prices.map((price, index) => ({
                value: `${index}`,
                label: `${price.pkg} ${getPriceSteps(price)}개 이상`,
                data: price
            }));
        };

        const getSelectedPkgIndex = (item: PcbItem): string => {
            if (!item.selectedPrice?.pkg || !item.parts?.prices) return '';
            const prices = getPriceOptions(item);
            const index = prices.findIndex(p => p.pkg === item.selectedPrice?.pkg);
            return index >= 0 ? `${index}` : '';
        };

        const handlePkgSelect = (item: PcbItem, value: string) => {
            if (!value || !item.parts?.prices) return;
            const prices = getPriceOptions(item);
            const index = parseInt(value);
            if (index >= 0 && index < prices.length) {
                const price = prices[index];
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
            }
        };

        const updateQty = (item: PcbItem, qty: number | string) => {
            const numQty = typeof qty === 'string' ? parseInt(qty) : qty;
            if (numQty > 0) {
                updateItemQty(item, numQty);
            }
        };

        return {
            getDesignator,
            getSelectBoxOptions,
            getSelectedPkgIndex,
            handlePkgSelect,
            updateQty,
            formatPrice,
            isActiveRange,
            isActiveSingleRange,
            isUnderMoq,
            getMoq,
            getCalculatedPrice
        };
    }
});
</script>
