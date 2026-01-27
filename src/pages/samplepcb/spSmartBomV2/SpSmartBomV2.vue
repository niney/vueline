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
                                        <div class="flex gap-6 items-start p-4 pl-12">
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
import { processFile } from "./services";
import NavItem from "./components/NavItem.vue";
import StatCard from "./components/StatCard.vue";
import IconButton from "./components/IconButton.vue";
import StatusBadge from "./components/StatusBadge.vue";

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
        StatusBadge
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

        return {
            sidebarOpen, darkMode, viewMode, fileName, pcbItemList, isLoading,
            pcbItems, matchedCount, unmatchedCount, matchedPercent, expandedRows,
            navItems, getDesignator, toggleRow, goBack, handleFileSelect, handleDrop
        };
    }
});
</script>
