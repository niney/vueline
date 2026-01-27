<template>
    <div class="sp-smart-bom-v2" :class="darkMode ? '' : 'light-mode'">
        <!-- 사이드바 -->
        <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
            <div class="logo flex items-center gap-2.5 mb-6">
                <span class="logo-icon">SB</span>
                <div class="logo-text">
                    <strong>SmartBOM</strong>
                    <small>Part Matching Engine</small>
                </div>
            </div>
            <nav class="nav-menu flex-1">
                <div class="nav-title">Navigation</div>
                <ul class="list-none p-0 m-0">
                    <li class="nav-item active"><i class="fas fa-file-alt"></i> BOMs</li>
                    <li class="nav-item"><i class="fas fa-microchip"></i> Parts Library</li>
                    <li class="nav-item"><i class="fas fa-chart-bar"></i> Analytics</li>
                    <li class="nav-item"><i class="fas fa-warehouse"></i> InvenTree</li>
                    <li class="nav-item"><i class="fas fa-cog"></i> Settings</li>
                </ul>
            </nav>
            <div class="sidebar-footer text-xs">
                <div>SmartBOM v0.1</div>
                <div class="link">InvenTree Integration</div>
            </div>
        </aside>

        <!-- 메인 컨텐츠 -->
        <main class="content flex-1 flex flex-col">
            <div class="content-toolbar flex items-center">
                <button class="btn-icon" @click="sidebarOpen = !sidebarOpen">
                    <IconPanelLeft :size="18" :stroke-width="1.5" />
                </button>
                <div class="flex-1"></div>
                <button class="btn-icon" @click="darkMode = !darkMode">
                    <IconSun v-if="darkMode" :size="18" :stroke-width="1.5" />
                    <IconMoon v-else :size="18" :stroke-width="1.5" />
                </button>
            </div>
            <div class="toolbar-divider"></div>

            <!-- 업로드 화면 -->
            <section v-if="viewMode === 'upload'" class="content-body flex-1 p-6">
                <div class="upload-area">
                    <div class="upload-dropzone" :class="{ 'is-loading': isLoading }" @drop.prevent="handleDrop" @dragover.prevent>
                        <!-- 로딩 오버레이 -->
                        <div v-if="isLoading" class="upload-loading">
                            <div class="spinner"></div>
                            <p>파일 분석 중...</p>
                        </div>
                        <!-- 기본 업로드 UI -->
                        <template v-else>
                            <div class="upload-icon">
                                <IconUpload :size="48" :stroke-width="1.5" />
                            </div>
                            <h2 class="upload-title">BOM 파일을 업로드하세요</h2>
                            <p class="upload-desc">파일을 드래그하거나 클릭하여 선택하세요</p>
                            <div class="upload-formats">xlsx, xls, csv 파일 지원</div>
                            <label class="upload-btn">
                                <input type="file" accept=".xlsx,.xls,.csv" hidden @change="handleFileSelect" />
                                파일 선택
                            </label>
                        </template>
                    </div>
                </div>
            </section>

            <!-- 결과 화면 -->
            <section v-else class="content-body result-view flex-1">
                <!-- 헤더 -->
                <div class="result-header">
                    <button class="btn-back" @click="goBack">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                    <div class="file-info">
                        <h2>{{ fileName }}</h2>
                        <small>{{ fileName }}</small>
                    </div>
                </div>

                <!-- 통계 카드 -->
                <div class="stats-row">
                    <div class="stat-card">
                        <div class="stat-label">TOTAL LINES</div>
                        <div class="stat-value">{{ pcbItems.length }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">MATCHED</div>
                        <div class="stat-value text-green">{{ matchedCount }} <span class="stat-percent">({{ matchedPercent }}%)</span></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">UNMATCHED</div>
                        <div class="stat-value text-red">{{ unmatchedCount }}</div>
                    </div>
                </div>

                <!-- 테이블 -->
                <div class="result-table-container">
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
                            <tr v-for="(item, index) in pcbItemList" :key="index">
                                <td><input type="checkbox" class="custom-checkbox" /></td>
                                <td><i class="fas fa-chevron-right"></i></td>
                                <td>{{ index + 1 }}</td>
                                <td>{{ getDesignator(item) }}</td>
                                <td>{{ item.qty || 1 }}</td>
                                <td>
                                    <div v-if="item.parts">
                                        {{ item.parts.partName }}
                                        <small class="text-muted">{{ item.parts.manufacturerName }}</small>
                                    </div>
                                    <div v-else class="text-muted">
                                        —<br><small>Unknown</small>
                                    </div>
                                </td>
                                <td>
                                    <span v-if="item.parts" class="badge badge-green">Found</span>
                                    <span v-else class="badge badge-red">Not Found</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import "./sp-smart-bom-v2-style.scss";
import {defineComponent, PropType, ref, computed} from 'vue';
import {SpSmartBomV2Params, PcbItem} from "@/model/sp-smart-bom-params";
import IconPanelLeft from "@/components/icons/IconPanelLeft.vue";
import IconSun from "@/components/icons/IconSun.vue";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconUpload from "@/components/icons/IconUpload.vue";
import * as XLSX from 'xlsx';

export default defineComponent({
    name: 'SpSmartBomV2',
    components: {
        IconPanelLeft,
        IconSun,
        IconMoon,
        IconUpload
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

        const goBack = () => {
            viewMode.value = 'upload';
            pcbItemList.value = [];
            fileName.value = '';
        };

        const processFile = async (file: File) => {
            isLoading.value = true;
            fileName.value = file.name;

            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellFormula: true, cellDates: true, raw: false });

                const allExcelData: any = { fileName: file.name, fileSize: file.size, sheets: [] };

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
                    const sheetData: any = { name: sheetName, range: { startRow: range.s.r, endRow: range.e.r, startCol: range.s.c, endCol: range.e.c }, cells: [] };

                    for (let row = range.s.r; row <= range.e.r; row++) {
                        for (let col = range.s.c; col <= range.e.c; col++) {
                            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                            const cell = worksheet[cellAddress];
                            if (cell) {
                                sheetData.cells.push({
                                    address: cellAddress, row, col,
                                    formatted: cell.w || '', raw: cell.v, type: cell.t || 'z',
                                    format: cell.z || '', formula: cell.f || '', style: cell.s || null
                                });
                            }
                        }
                    }
                    allExcelData.sheets.push(sheetData);
                });

                const formData = new FormData();
                formData.append('file', file);
                formData.append('excelData', JSON.stringify(allExcelData));

                const response = await fetch(props.params.mlServerUrl || '', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('API 요청 실패');

                const result = await response.json();
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
            if (file) processFile(file);
        };

        const handleDrop = (event: DragEvent) => {
            const file = event.dataTransfer?.files?.[0];
            if (file) processFile(file);
        };

        return {
            sidebarOpen, darkMode, viewMode, fileName, pcbItemList, isLoading,
            pcbItems, matchedCount, unmatchedCount, matchedPercent,
            getDesignator, goBack, handleFileSelect, handleDrop
        };
    }
});
</script>

