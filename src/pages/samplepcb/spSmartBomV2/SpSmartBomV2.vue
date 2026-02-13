<template>
    <div class="sp-smart-bom-v2" :class="darkMode ? '' : 'light-mode'">
        <!-- 사이드바 -->
        <aside
            class="flex flex-col transition-all duration-300 overflow-hidden"
            :class="darkMode ? 'bg-[#12151a]' : 'bg-slate-50'"
            :style="sidebarOpen ? 'width: 220px; padding: 16px;' : 'width: 0; padding: 0;'"
        >
            <div class="flex items-center gap-2.5 mb-6">
                <span class="bg-blue-500 p-2 rounded-lg font-bold">SB</span>
                <div>
                    <strong>SmartBOM</strong>
                    <small class="block text-xs" :class="darkMode ? 'text-gray-500' : 'text-gray-500'">
                        Part Matching Engine
                    </small>
                </div>
            </div>

            <nav class="flex-1">
                <div class="text-[11px] uppercase tracking-wide mb-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                    Navigation
                </div>
                <ul class="list-none p-0 m-0">
                    <NavItem
                        v-for="item in navItems"
                        :key="item.label"
                        :icon="item.icon"
                        :label="item.label"
                        :active="item.active"
                        :dark-mode="darkMode"
                    />
                </ul>
            </nav>

            <div class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-gray-500'">
                <div>SmartBOM v0.1</div>
                <div class="text-blue-400">InvenTree Integration</div>
            </div>
        </aside>

        <!-- 메인 컨텐츠 -->
        <main class="flex-1 flex flex-col">
            <div class="flex items-center px-3 py-2.5">
                <IconButton :dark-mode="darkMode" @click="sidebarOpen = !sidebarOpen">
                    <IconPanelLeft :size="18" :stroke-width="1.5" />
                </IconButton>
                <div class="flex-1"></div>
                <IconButton :dark-mode="darkMode" @click="darkMode = !darkMode">
                    <IconSun v-if="darkMode" :size="18" :stroke-width="1.5" />
                    <IconMoon v-else :size="18" :stroke-width="1.5" />
                </IconButton>
            </div>
            <div class="h-px" :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'"></div>

            <!-- 업로드 화면 -->
            <section v-if="viewMode === 'upload'" class="flex-1 p-6 flex items-center justify-center">
                <div class="w-full max-w-[500px]">
                    <div
                        class="border-2 border-dashed border-blue-500 rounded-2xl px-8 py-12 text-center bg-blue-500/5 transition-all hover:bg-blue-500/10 hover:border-blue-400"
                        :class="{ 'pointer-events-none': isLoading }"
                        @drop.prevent="handleDrop"
                        @dragover.prevent
                    >
                        <!-- 로딩 오버레이 -->
                        <div v-if="isLoading" class="flex flex-col items-center gap-4">
                            <div class="spinner"></div>
                            <p class="text-gray-400 text-sm">파일 분석 중...</p>
                        </div>
                        <!-- 기본 업로드 UI -->
                        <template v-else>
                            <div class="text-blue-500 mb-4 flex justify-center">
                                <IconUpload :size="48" :stroke-width="1.5" />
                            </div>
                            <h2 class="text-xl font-semibold m-0 mb-2">BOM 파일을 업로드하세요</h2>
                            <p class="text-gray-400 m-0 mb-2 text-sm">파일을 드래그하거나 클릭하여 선택하세요</p>
                            <div class="text-gray-500 text-xs mb-6">xlsx, xls, csv 파일 지원</div>
                            <label class="inline-block bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600">
                                <input type="file" accept=".xlsx,.xls,.csv" hidden @change="handleFileSelect" />
                                파일 선택
                            </label>
                        </template>
                    </div>
                </div>
            </section>

            <!-- 결과 화면 -->
            <section v-else class="flex-1 flex flex-col p-6">
                <!-- 헤더 -->
                <div class="flex items-center gap-6 mb-6">
                    <button
                        class="bg-transparent border border-gray-600 cursor-pointer text-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-700 hover:border-gray-700"
                        :class="darkMode ? 'text-white' : 'text-gray-900'"
                        @click="goBack"
                    >
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <div>
                        <h2 class="text-lg m-0">{{ fileName }}</h2>
                        <small class="text-gray-400">{{ fileName }}</small>
                    </div>
                </div>

                <!-- 통계 카드 -->
                <div class="flex gap-4 mb-6">
                    <StatCard
                        label="TOTAL LINES"
                        :value="pcbItems.length"
                        :dark-mode="darkMode"
                    />
                    <StatCard
                        label="MATCHED"
                        :value="matchedCount"
                        :percent="matchedPercent"
                        variant="success"
                        :dark-mode="darkMode"
                    />
                    <StatCard
                        label="UNMATCHED"
                        :value="unmatchedCount"
                        variant="error"
                        :dark-mode="darkMode"
                    />
                </div>

                <!-- 테이블 -->
                <div class="flex-1 overflow-auto">
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
                                <tr class="cursor-pointer" @click="toggleRow(index)">
                                    <td @click.stop><input type="checkbox" class="custom-checkbox" /></td>
                                    <td>
                                        <i
                                            class="fas text-[10px] text-gray-400 cursor-pointer hover:text-white"
                                            :class="expandedRows.has(index) ? 'fa-chevron-down' : 'fa-chevron-right'"
                                        ></i>
                                    </td>
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ getDesignator(item) }}</td>
                                    <td>{{ item.qty || 1 }}</td>
                                    <td>
                                        <div v-if="item.parts">
                                            {{ item.parts.partName }}
                                            <small class="block mt-1 text-gray-400">{{ item.parts.manufacturerName }}</small>
                                        </div>
                                        <div v-else class="text-gray-400">
                                            —<br><small>Unknown</small>
                                        </div>
                                    </td>
                                    <td>
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
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import "./sp-smart-bom-v2-style.scss";
import { defineComponent, PropType, ref, computed } from 'vue';
import { SpSmartBomV2Params, PcbItem } from "@/model/sp-smart-bom-params";
import IconPanelLeft from "@/components/icons/IconPanelLeft.vue";
import IconSun from "@/components/icons/IconSun.vue";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import {
    processFile,
    updateSelectedPrice,
    formatPrice,
    getPriceOptions,
    getPriceSteps,
    updateItemQty,
    isActiveRange,
    isActiveSingleRange,
    isUnderMoq,
    getMoq,
    getCalculatedPrice
} from "./services";
import NavItem from "./components/NavItem.vue";
import StatCard from "./components/StatCard.vue";
import IconButton from "./components/IconButton.vue";
import StatusBadge from "./components/StatusBadge.vue";
import SelectBox from "./components/SelectBox.vue";
import type { SelectOption } from "./components/SelectBox.vue";
import NumberInput from "./components/NumberInput.vue";

export default defineComponent({
    name: 'SpSmartBomV2',
    components: {
        IconPanelLeft,
        IconSun,
        IconMoon,
        IconUpload,
        NavItem,
        StatCard,
        IconButton,
        StatusBadge,
        SelectBox,
        NumberInput
    },
    props: {
        params: {
            type: Object as PropType<SpSmartBomV2Params>,
            required: true
        }
    },
    setup(props) {
        const sidebarOpen = ref(true);
        const darkMode = ref(true);
        const viewMode = ref<'upload' | 'result'>('upload');
        const fileName = ref('');
        const pcbItemList = ref<PcbItem[]>([]);
        const isLoading = ref(false);
        const expandedRows = ref<Set<number>>(new Set());

        const navItems = [
            { icon: 'fas fa-file-alt', label: 'BOMs', active: true },
            { icon: 'fas fa-microchip', label: 'Parts Library', active: false },
            { icon: 'fas fa-chart-bar', label: 'Analytics', active: false },
            { icon: 'fas fa-warehouse', label: 'InvenTree', active: false },
            { icon: 'fas fa-cog', label: 'Settings', active: false }
        ];

        // 통계 (is_pcb=true 기준)
        const pcbItems = computed(() => pcbItemList.value.filter(i => i.is_pcb === true));
        const matchedCount = computed(() => pcbItems.value.filter(i => i.parts).length);
        const unmatchedCount = computed(() => pcbItems.value.filter(i => !i.parts).length);
        const matchedPercent = computed(() => {
            if (pcbItems.value.length === 0) return 0;
            return Math.round((matchedCount.value / pcbItems.value.length) * 100);
        });

        const getDesignator = (item: PcbItem) => {
            return item.reference_prefix || item.number?.[0] || '-';
        };

        const toggleRow = (index: number) => {
            if (expandedRows.value.has(index)) {
                expandedRows.value.delete(index);
            } else {
                expandedRows.value.add(index);
            }
            expandedRows.value = new Set(expandedRows.value); // reactivity trigger
        };

        const goBack = () => {
            viewMode.value = 'upload';
            pcbItemList.value = [];
            fileName.value = '';
        };

        const handleFile = async (file: File) => {
            isLoading.value = true;
            fileName.value = file.name;

            try {
                const { result } = await processFile(file, props.params.mlServerUrl || '');
                // 각 아이템에 대해 초기 가격 설정
                result.forEach(item => updateSelectedPrice(item));
                pcbItemList.value = result;
                viewMode.value = 'result';
            } catch (error) {
                console.error('파일 처리 오류:', error);
                alert('파일 처리 중 오류가 발생했습니다.');
            } finally {
                isLoading.value = false;
            }
        };

        const handleFileSelect = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) handleFile(file);
        };

        const handleDrop = (event: DragEvent) => {
            const file = event.dataTransfer?.files?.[0];
            if (file) handleFile(file);
        };

        // SelectBox 옵션 생성
        const getSelectBoxOptions = (item: PcbItem): SelectOption[] => {
            const prices = getPriceOptions(item);
            return prices.map((price, index) => ({
                value: `${index}`,
                label: `${price.pkg} ${getPriceSteps(price)}개 이상`,
                data: price
            }));
        };

        // SelectBox 선택값 가져오기
        const getSelectedPkgIndex = (item: PcbItem): string => {
            if (!item.selectedPrice?.pkg || !item.parts?.prices) return '';
            const prices = getPriceOptions(item);
            const index = prices.findIndex(p => p.pkg === item.selectedPrice?.pkg);
            return index >= 0 ? `${index}` : '';
        };

        // SelectBox 선택 변경 핸들러 (V1과 동일하게 breakQuantity를 qty로 설정)
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
            sidebarOpen, darkMode, viewMode, fileName, pcbItemList, isLoading,
            pcbItems, matchedCount, unmatchedCount, matchedPercent, expandedRows,
            navItems, getDesignator, toggleRow, goBack, handleFileSelect, handleDrop,
            // 가격 관련 (서비스에서 import)
            formatPrice, getPriceOptions, getPriceSteps, updateQty,
            isActiveRange, isActiveSingleRange, isUnderMoq, getMoq, getCalculatedPrice,
            // SelectBox 관련
            getSelectBoxOptions, getSelectedPkgIndex, handlePkgSelect
        };
    }
});
</script>
