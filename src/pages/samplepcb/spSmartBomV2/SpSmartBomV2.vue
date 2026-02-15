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
                <!-- 일반 사용자 뷰 -->
                <template v-if="!isEditMode">
                    <!-- 헤더 -->
                    <div class="flex items-center gap-6 mb-6">
                        <button
                            class="bg-transparent border border-gray-600 cursor-pointer text-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-700 hover:border-gray-700"
                            :class="darkMode ? 'text-white' : 'text-gray-900'"
                            @click="goBack"
                        >
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <div class="flex-1">
                            <h2 class="text-lg m-0">{{ fileName }}</h2>
                            <small class="text-gray-400">{{ fileName }}</small>
                        </div>
                        <IconButton
                            v-if="windowWidth < 1024"
                            :dark-mode="darkMode"
                            @click="rightPanelOpen = !rightPanelOpen"
                        >
                            <i class="fas fa-chart-bar text-sm"></i>
                        </IconButton>
                    </div>

                    <BomResultTable
                        :pcb-item-list="pcbItemList"
                        :dark-mode="darkMode"
                        :expanded-rows="expandedRows"
                        :selected-rows="selectedRows"
                        :right-panel-open="rightPanelOpen"
                        @toggle-row="toggleRow"
                        @toggle-select="toggleSelect"
                    />

                    <OrderPanel
                        :dark-mode="darkMode"
                        :right-panel-open="rightPanelOpen"
                        :pcb-items="pcbItems"
                        :matched-count="matchedCount"
                        :matched-percent="matchedPercent"
                        :unmatched-count="unmatchedCount"
                        :order-summary="orderSummary"
                        :total-amount="totalAmount"
                        :final-amount="finalAmount"
                        :is-edit-mode="false"
                        @request-quote="handleRequestQuote"
                        @add-to-cart="handleAddToCart"
                    />
                </template>

                <!-- 관리자 뷰 -->
                <AdminResultView
                    v-else
                    :pcb-item-list="pcbItemList"
                    :dark-mode="darkMode"
                    :selected-rows="selectedRows"
                    :file-name="fileName"
                    :pcb-items="pcbItems"
                    :matched-count="matchedCount"
                    :matched-percent="matchedPercent"
                    :unmatched-count="unmatchedCount"
                    :order-summary="orderSummary"
                    :total-amount="adminTotalAmount"
                    :final-amount="adminFinalAmount"
                    :margin-summary="marginSummary"
                    @go-back="goBack"
                    @toggle-select="toggleSelect"
                    @toggle-select-all="toggleSelectAll"
                    @update-qty="triggerReactivity"
                    @update-price-override="triggerReactivity"
                    @reset-price-override="handleResetPriceOverride"
                    @update-package="triggerReactivity"
                    @save="handleSave"
                    @update:shipping-fee="orderSummary.shippingFee = $event"
                    @update:management-fee="orderSummary.managementFee = $event"
                    @update:discount="orderSummary.discount = $event"
                    @update:expected-delivery="orderSummary.expectedDelivery = $event"
                    @update:memo="orderSummary.memo = $event"
                />
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import "./sp-smart-bom-v2-style.scss";
import { defineComponent, PropType, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { SpSmartBomV2Params, PcbItem, OrderSummaryV2 } from "@/model/sp-smart-bom-params";
import IconPanelLeft from "@/components/icons/IconPanelLeft.vue";
import IconSun from "@/components/icons/IconSun.vue";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import { processFile, updateSelectedPrice, getCalculatedPrice, getSalePrice, calculateMarginSummary, removePriceOverride } from "./services";
import NavItem from "./components/NavItem.vue";
import IconButton from "./components/IconButton.vue";
import BomResultTable from "./components/BomResultTable.vue";
import OrderPanel from "./components/OrderPanel.vue";
import AdminResultView from "./components/AdminResultView.vue";

export default defineComponent({
    name: 'SpSmartBomV2',
    components: {
        IconPanelLeft,
        IconSun,
        IconMoon,
        IconUpload,
        NavItem,
        IconButton,
        BomResultTable,
        OrderPanel,
        AdminResultView
    },
    props: {
        params: {
            type: Object as PropType<SpSmartBomV2Params>,
            required: true
        }
    },
    setup(props) {
        const sidebarOpen = ref(window.innerWidth >= 768);
        const darkMode = ref(true);
        const viewMode = ref<'upload' | 'result'>('upload');
        const fileName = ref('');
        const pcbItemList = ref<PcbItem[]>([]);
        const isLoading = ref(false);
        const expandedRows = ref<Set<number>>(new Set());
        const selectedRows = ref<Set<number>>(new Set());
        const isEditMode = ref(false);
        const rightPanelOpen = ref(window.innerWidth >= 1024);
        const windowWidth = ref(window.innerWidth);

        const orderSummary = ref<OrderSummaryV2>({
            fileInfo: null,
            quantity: 1,
            expectedDelivery: '2주',
            shippingFee: 30000,
            managementFee: 25000,
            totalAmount: 0,
            finalAmount: 0,
            discount: 0,
            memo: ''
        });

        // URL 파라미터로 편집 모드 확인
        const urlParams = new URLSearchParams(window.location.search);
        isEditMode.value = urlParams.get('mode') === 'edit';

        // 관리자 모드일 때 사이드바 접기
        if (isEditMode.value) {
            sidebarOpen.value = false;
        }

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

        // 반응형 사이드바 + 오른쪽 패널
        const onResize = () => {
            windowWidth.value = window.innerWidth;
            if (!isEditMode.value) {
                sidebarOpen.value = windowWidth.value >= 768;
            }
            rightPanelOpen.value = windowWidth.value >= 1024;
        };
        onMounted(() => window.addEventListener('resize', onResize));
        onBeforeUnmount(() => window.removeEventListener('resize', onResize));

        // 추정 예상금액 계산
        const totalAmount = computed(() => {
            return pcbItemList.value
                .filter((_, index) => selectedRows.value.has(index))
                .filter(item => item.selectedPrice)
                .reduce((sum, item) => sum + getCalculatedPrice(item), 0);
        });

        const finalAmount = computed(() => {
            return totalAmount.value + orderSummary.value.shippingFee + orderSummary.value.managementFee;
        });

        // 관리자 모드: 판매가 기준 합계
        const adminTotalAmount = computed(() => {
            return pcbItemList.value
                .filter((_, index) => selectedRows.value.has(index))
                .filter(item => item.selectedPrice)
                .reduce((sum, item) => sum + getSalePrice(item) * item.selectedPrice!.qty, 0);
        });

        const adminFinalAmount = computed(() => {
            return adminTotalAmount.value
                + orderSummary.value.shippingFee
                + orderSummary.value.managementFee
                - (orderSummary.value.discount || 0);
        });

        const marginSummary = computed(() => {
            return calculateMarginSummary(pcbItemList.value, selectedRows.value);
        });

        const toggleSelectAll = () => {
            const pcbIndices = pcbItemList.value
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.is_pcb === true)
                .map(({ idx }) => idx);

            if (selectedRows.value.size === pcbIndices.length) {
                selectedRows.value = new Set();
            } else {
                selectedRows.value = new Set(pcbIndices);
            }
        };

        const handleResetPriceOverride = (index: number) => {
            removePriceOverride(pcbItemList.value[index]);
            pcbItemList.value = [...pcbItemList.value];
        };

        const triggerReactivity = () => {
            pcbItemList.value = [...pcbItemList.value];
        };

        // 핸들러
        const getSelectedItems = () => {
            return pcbItemList.value.filter((_, index) => selectedRows.value.has(index));
        };

        const handleRequestQuote = () => {
            orderSummary.value.totalAmount = totalAmount.value;
            orderSummary.value.finalAmount = finalAmount.value;
            const selectedItems = getSelectedItems();
            if (props.params.onRequestQuote) {
                props.params.onRequestQuote(selectedItems, orderSummary.value);
            }
        };

        const handleAddToCart = () => {
            orderSummary.value.totalAmount = totalAmount.value;
            orderSummary.value.finalAmount = finalAmount.value;
            const selectedItems = getSelectedItems();
            if (props.params.onAddToCart) {
                props.params.onAddToCart(selectedItems, orderSummary.value, {} as any);
            }
        };

        const handleSave = () => {
            orderSummary.value.totalAmount = totalAmount.value;
            orderSummary.value.finalAmount = finalAmount.value;
            const selectedItems = getSelectedItems();
            if (props.params.onSave) {
                props.params.onSave(selectedItems, orderSummary.value, {} as any);
            }
        };

        const toggleSelect = (index: number) => {
            if (selectedRows.value.has(index)) {
                selectedRows.value.delete(index);
            } else {
                selectedRows.value.add(index);
            }
            selectedRows.value = new Set(selectedRows.value);
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
            orderSummary.value.fileInfo = null;
        };

        const handleFile = async (file: File) => {
            isLoading.value = true;
            fileName.value = file.name;

            try {
                // BOM 분석 + 파일 업로드 (캐시 확인 포함)
                const { result, fileInfo } = await processFile(file, props.params.mlServerUrl || '');

                // 분석 결과 처리
                result.forEach(item => updateSelectedPrice(item));
                pcbItemList.value = result;

                // is_pcb=true인 항목을 초기 선택 상태로 설정
                const selected = new Set<number>();
                result.forEach((item, index) => {
                    if (item.is_pcb === true) selected.add(index);
                });
                selectedRows.value = selected;

                // fileInfo 저장
                orderSummary.value.fileInfo = fileInfo;

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

        return {
            sidebarOpen, darkMode, viewMode, fileName, pcbItemList, isLoading,
            pcbItems, matchedCount, unmatchedCount, matchedPercent, expandedRows, selectedRows,
            navItems, toggleSelect, toggleRow, goBack, handleFileSelect, handleDrop,
            // 주문 요약 관련
            orderSummary, totalAmount, finalAmount, isEditMode,
            handleRequestQuote, handleAddToCart, handleSave,
            // 관리자 모드
            adminTotalAmount, adminFinalAmount, marginSummary,
            toggleSelectAll, handleResetPriceOverride, triggerReactivity,
            // 오른쪽 패널
            rightPanelOpen, windowWidth
        };
    }
});
</script>
