<template>
    <div class="mx-auto py-4 px-4">
        <h1 class="text-2xl font-bold mb-4">Smart Aegis</h1>

        <!-- 파일 업로드 영역 -->
        <div
            class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 cursor-pointer"
            :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
        >
            <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls"
                class="hidden"
                @click.stop
                @change="handleFileSelect"
            />
            <p class="text-gray-600">
                엑셀 파일을 드래그하거나 클릭하여 업로드하세요
            </p>
            <p class="text-sm text-gray-400 mt-2">(.xlsx, .xls 파일 지원)</p>
        </div>

        <!-- 파일 정보 및 분석 버튼 -->
        <div v-if="fileName" class="mb-4 flex items-center gap-4">
            <span class="text-sm text-gray-600">
                파일: <span class="font-medium">{{ fileName }}</span>
            </span>
            <button
                @click="analyzeFile"
                :disabled="isLoading"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                분석 시작
            </button>
        </div>

        <!-- 로딩 -->
        <div v-if="isLoading" class="text-center py-8">
            <div class="loader mx-auto mb-2"></div>
            <p class="text-gray-600">분석 중...</p>
        </div>

        <!-- 시트 선택 (분석 결과가 없을 때만) -->
        <div v-if="sheetNames.length > 1 && !analysisResults" class="mb-4">
            <label class="mr-2">시트 선택:</label>
            <select v-model="selectedSheet" @change="loadSheet" class="border p-2 rounded">
                <option v-for="sheet in sheetNames" :key="sheet" :value="sheet">{{ sheet }}</option>
            </select>
        </div>

        <!-- 데이터 그리드 (분석 결과가 없을 때만) -->
        <div v-if="headers.length > 0 && !analysisResults" class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-200">
                <thead class="bg-gray-100">
                    <tr>
                        <th
                            v-for="(header, index) in headers"
                            :key="index"
                            class="py-2 px-4 border-b text-left font-medium"
                        >
                            {{ header }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="hover:bg-gray-50">
                        <td
                            v-for="(cell, cellIndex) in row"
                            :key="cellIndex"
                            class="py-2 px-4 border-b"
                        >
                            {{ cell }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 데이터 없음 -->
        <div v-else-if="fileName && headers.length === 0 && !analysisResults" class="text-center text-gray-500 py-8">
            데이터가 없습니다.
        </div>

        <!-- 분석 결과 (카드 형식) -->
        <div v-if="analysisResults" class="mt-4">
            <h2 class="text-xl font-bold mb-4">분석 결과</h2>
            <div class="mb-4 text-sm text-gray-600">
                전체 {{ analysisResults.total_rows }}행 / 분석 {{ analysisResults.analyzed_rows }}행 / PCB BOM {{ analysisResults.pcb_rows }}개
            </div>

            <!-- 카드 리스트 -->
            <div class="space-y-4">
                <div
                    v-for="item in analysisResults.results"
                    :key="item.index"
                    class="result-card border rounded-lg p-4"
                    :class="item.is_pcb_bom ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'"
                >
                    <!-- 헤더 -->
                    <div class="flex items-center justify-between mb-3 pb-2 border-b">
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-medium text-gray-500">#{{ item.index }}</span>
                            <span
                                class="px-2 py-1 text-xs rounded-full"
                                :class="item.is_pcb_bom ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'"
                            >
                                {{ item.is_pcb_bom ? 'PCB BOM' : 'Non-BOM' }}
                            </span>
                            <span :class="getConfidenceClass(item.confidence)" class="text-sm">
                                {{ (item.confidence * 100).toFixed(0) }}%
                            </span>
                        </div>
                    </div>

                    <!-- Original Text -->
                    <div class="mb-3">
                        <span class="text-xs text-gray-500">Original Text</span>
                        <p class="text-sm bg-white p-2 rounded border mt-1">{{ item.original_text }}</p>
                    </div>

                    <!-- Extracted Data -->
                    <div v-if="item.is_pcb_bom" class="mb-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div class="bg-white p-2 rounded border">
                            <span class="text-xs text-gray-500">Part Number</span>
                            <p class="text-sm font-medium">{{ item.extracted_data.part_number || '-' }}</p>
                        </div>
                        <div class="bg-white p-2 rounded border">
                            <span class="text-xs text-gray-500">Manufacturer</span>
                            <p class="text-sm">{{ item.extracted_data.manufacturer || '-' }}</p>
                        </div>
                        <div class="bg-white p-2 rounded border">
                            <span class="text-xs text-gray-500">Package</span>
                            <p class="text-sm">{{ item.extracted_data.package || '-' }}</p>
                        </div>
                        <div class="bg-white p-2 rounded border">
                            <span class="text-xs text-gray-500">Quantity</span>
                            <p class="text-sm">{{ item.extracted_data.quantity || '-' }}</p>
                        </div>
                        <div class="bg-white p-2 rounded border col-span-2">
                            <span class="text-xs text-gray-500">Reference</span>
                            <p class="text-sm">{{ item.extracted_data.reference || '-' }}</p>
                        </div>
                        <div class="bg-white p-2 rounded border col-span-2 md:col-span-3">
                            <span class="text-xs text-gray-500">Description</span>
                            <p class="text-sm">{{ item.extracted_data.description || '-' }}</p>
                        </div>
                    </div>

                    <!-- Reason -->
                    <div>
                        <span class="text-xs text-gray-500">Reason</span>
                        <p class="text-sm text-gray-600 mt-1">{{ item.reason }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import * as XLSX from 'xlsx';
import '@/tailwind.css';

export default defineComponent({
    name: 'SpSmartAegisApp',
    props: {
        params: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isDragging: false,
            fileName: '',
            isLoading: false,
            workbook: null as XLSX.WorkBook | null,
            sheetNames: [] as string[],
            selectedSheet: '',
            headers: [] as string[],
            rows: [] as string[][],
            excelData: null as any,
            analysisResults: null as any
        };
    },
    computed: {
        pcbBomItems(): any[] {
            if (!this.analysisResults?.results) return [];
            return this.analysisResults.results.filter((item: any) => item.is_pcb_bom);
        }
    },
    created() {
        console.log('SpSmartAegisApp created');
    },
    methods: {
        triggerFileInput() {
            (this.$refs.fileInput as HTMLInputElement).click();
        },
        handleFileSelect(event: Event) {
            const input = event.target as HTMLInputElement;
            if (input.files && input.files[0]) {
                this.processFile(input.files[0]);
            }
        },
        handleDrop(event: DragEvent) {
            this.isDragging = false;
            if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
                this.processFile(event.dataTransfer.files[0]);
            }
        },
        processFile(file: File) {
            this.fileName = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                this.workbook = XLSX.read(data, {type: 'array'});
                this.sheetNames = this.workbook.SheetNames;
                this.selectedSheet = this.sheetNames[0];

                // excelData 구성 (SpSmartBom과 동일한 형식)
                this.excelData = {
                    fileName: file.name,
                    fileSize: file.size,
                    sheets: []
                };

                this.workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = this.workbook!.Sheets[sheetName];
                    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

                    const sheetData: any = {
                        name: sheetName,
                        range: {
                            startRow: range.s.r,
                            endRow: range.e.r,
                            startCol: range.s.c,
                            endCol: range.e.c
                        },
                        cells: []
                    };

                    // 모든 셀 데이터 추출
                    for (let row = range.s.r; row <= range.e.r; row++) {
                        for (let col = range.s.c; col <= range.e.c; col++) {
                            const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                            const cell = worksheet[cellAddress];

                            if (cell) {
                                sheetData.cells.push({
                                    address: cellAddress,
                                    row: row,
                                    col: col,
                                    formatted: cell.w || '',
                                    raw: cell.v,
                                    type: cell.t || 'z',
                                    format: cell.z || '',
                                    formula: cell.f || '',
                                    style: cell.s || null
                                });
                            }
                        }
                    }

                    // 빈 행 제거
                    const nonEmptyRows = new Set<number>();
                    sheetData.cells.forEach((cell: any) => {
                        if (cell.formatted && cell.formatted.toString().trim() !== '') {
                            nonEmptyRows.add(cell.row);
                        }
                    });

                    if (nonEmptyRows.size > 0) {
                        const maxNonEmptyRow = Math.max(...Array.from(nonEmptyRows));
                        sheetData.cells = sheetData.cells.filter((cell: any) => cell.row <= maxNonEmptyRow);
                        sheetData.range.endRow = maxNonEmptyRow;
                    }

                    this.excelData.sheets.push(sheetData);
                });

                this.loadSheet();
            };
            reader.readAsArrayBuffer(file);
        },
        loadSheet() {
            if (!this.workbook || !this.selectedSheet) return;

            const sheet = this.workbook.Sheets[this.selectedSheet];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {header: 1});

            // 헤더 행 자동 감지 (컬럼이 3개 이상인 첫 번째 행)
            const headerIndex = jsonData.findIndex(row => row && row.length >= 3);

            if (headerIndex !== -1) {
                this.headers = jsonData[headerIndex].map(h => h?.toString() || '');
                this.rows = jsonData.slice(headerIndex + 1)
                    .filter(row => row && row.length > 0)
                    .map(row => this.headers.map((_, i) => row[i]?.toString() || ''));
            } else {
                this.headers = [];
                this.rows = [];
            }
        },
        analyzeFile() {
            if (!this.excelData) return;

            this.isLoading = true;

            const formData = new FormData();
            formData.append('excelData', JSON.stringify(this.excelData));

            $.ajax({
                url: this.params.mlServerUrl + '/aegisAnalysis',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: (response) => {
                    console.log('분석 결과:', response);
                    this.isLoading = false;
                    if (response.result && response.data) {
                        this.analysisResults = response.data;
                    }
                },
                error: (error) => {
                    console.error('분석 오류:', error);
                    this.isLoading = false;
                    alert(`분석 실패!\n\n오류 내용:\n${error.responseText || error.statusText || '알 수 없는 오류'}`);
                }
            });
        },
        getConfidenceClass(confidence: number): string {
            if (confidence >= 0.7) return 'text-green-600 font-medium';
            if (confidence >= 0.4) return 'text-yellow-600';
            return 'text-red-500';
        }
    }
});
</script>

<style lang="scss">
@use "tailwindcss";
.upload-area {
    transition: all 0.2s ease;

    &:hover {
        border-color: #3b82f6;
        background-color: #eff6ff;
    }
}

.loader {
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
