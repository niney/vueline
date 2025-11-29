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
            <select v-model="selectedModel" class="border p-2 rounded text-sm">
                <option v-for="model in modelList" :key="model" :value="model">{{ model }}</option>
            </select>
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
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold">분석 결과</h2>
                <button
                    @click="openVerifyModal"
                    :disabled="partNumberItems.length === 0"
                    class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    부품번호 검증 ({{ partNumberItems.length }})
                </button>
            </div>
            <div class="flex items-center justify-between mb-4">
                <div class="text-sm text-gray-600">
                    전체 {{ analysisResults.total_rows }}행 / 분석 {{ analysisResults.analyzed_rows }}행 / PCB BOM {{ analysisResults.pcb_rows }}개
                </div>
                <div class="flex gap-1">
                    <button
                        @click="filterMode = 'all'"
                        class="px-3 py-1 text-sm rounded"
                        :class="filterMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                    >
                        전체 ({{ analysisResults.results.length }})
                    </button>
                    <button
                        @click="filterMode = 'verified'"
                        class="px-3 py-1 text-sm rounded"
                        :class="filterMode === 'verified' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                    >
                        검증됨 ({{ verifiedCount }})
                    </button>
                </div>
            </div>

            <!-- 카드 리스트 -->
            <div class="space-y-4">
                <div
                    v-for="item in filteredResults"
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
                            <div class="flex items-center gap-2">
                                <p class="text-sm font-medium">{{ item.extracted_data.part_number || '-' }}</p>
                                <span
                                    v-if="verificationResults[item.index] === true"
                                    class="px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700"
                                >검증됨</span>
                                <span
                                    v-else-if="verificationResults[item.index] === false"
                                    class="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700"
                                >미확인</span>
                            </div>
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

        <!-- 부품번호 검증 모달 -->
        <div v-if="showVerifyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b">
                    <h3 class="text-lg font-bold">부품번호 검증</h3>
                    <button @click="closeVerifyModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <div class="p-4 overflow-y-auto max-h-[60vh]">
                    <div class="mb-4 text-sm text-gray-600">
                        총 {{ partNumberItems.length }}개 부품번호
                        <span v-if="isVerifying"> - 검증 중... ({{ verificationProgress }}/{{ partNumberItems.length }})</span>
                    </div>
                    <table class="min-w-full bg-white border border-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-2 px-3 border-b text-left text-sm">Row</th>
                                <th class="py-2 px-3 border-b text-left text-sm">Part Number</th>
                                <th class="py-2 px-3 border-b text-left text-sm">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in partNumberItems" :key="item.index" class="hover:bg-gray-50">
                                <td class="py-2 px-3 border-b text-sm">#{{ item.index }}</td>
                                <td class="py-2 px-3 border-b text-sm font-medium">{{ item.extracted_data.part_number }}</td>
                                <td class="py-2 px-3 border-b text-sm">
                                    <span v-if="verificationResults[item.index] === undefined" class="text-gray-400">대기</span>
                                    <span v-else-if="verificationResults[item.index] === 'loading'" class="text-blue-500">검증 중...</span>
                                    <span v-else-if="verificationResults[item.index] === true" class="text-green-600">검증됨</span>
                                    <span v-else class="text-red-500">미확인</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="flex justify-end gap-2 p-4 border-t">
                    <button
                        @click="closeVerifyModal"
                        class="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        닫기
                    </button>
                    <button
                        @click="verifyPartNumbers"
                        :disabled="isVerifying"
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {{ isVerifying ? '검증 중...' : '검증' }}
                    </button>
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
            analysisResults: null as any,
            // 부품번호 검증
            showVerifyModal: false,
            isVerifying: false,
            verificationResults: {} as Record<number, boolean | 'loading'>,
            verificationProgress: 0,
            filterMode: 'all' as 'all' | 'verified',
            // 모델 선택
            modelList: [
                'gpt-oss:20b',
                'gpt-oss:120b',
                'cogito-2.1:671b',
                'glm-4.6',
                'kimi-k2:1t',
                'kimi-k2-thinking',
                'qwen3-coder:480b',
                'deepseek-v3.1:671b',
                'qwen3-vl:235b-instruct',
                'qwen3-vl:235b',
                'minimax-m2',
                'gemini-3-pro-preview'
            ] as string[],
            selectedModel: 'gpt-oss:20b'
        };
    },
    computed: {
        pcbBomItems(): any[] {
            if (!this.analysisResults?.results) return [];
            return this.analysisResults.results.filter((item: any) => item.is_pcb_bom);
        },
        partNumberItems(): any[] {
            if (!this.analysisResults?.results) return [];
            return this.analysisResults.results.filter(
                (item: any) => item.is_pcb_bom && item.extracted_data?.part_number
            );
        },
        verifiedCount(): number {
            return Object.values(this.verificationResults).filter(v => v === true).length;
        },
        filteredResults(): any[] {
            if (!this.analysisResults?.results) return [];
            if (this.filterMode === 'all') {
                return this.analysisResults.results;
            }
            return this.analysisResults.results.filter(
                (item: any) => this.verificationResults[item.index] === true
            );
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
            formData.append('model', this.selectedModel);

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
        },
        openVerifyModal() {
            this.showVerifyModal = true;
            this.verificationResults = {};
            this.verificationProgress = 0;
        },
        closeVerifyModal() {
            this.showVerifyModal = false;
        },
        async verifyPartNumbers() {
            this.isVerifying = true;
            this.verificationProgress = 0;

            const items = this.partNumberItems;
            const batchSize = 3;

            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);

                // 배치 내 항목들을 loading 상태로
                batch.forEach(item => {
                    this.verificationResults[item.index] = 'loading';
                });

                // 병렬로 3개 요청
                const promises = batch.map(item => {
                    const partNumber = item.extracted_data.part_number;
                    const url = `${this.params.searchServerUrl}/pcbParts/_indexingByDigikey?partNumber=${encodeURIComponent(partNumber)}`;

                    return $.get(url)
                        .then((response: any) => {
                            // result: true면 데이터 있음, false면 없음
                            this.verificationResults[item.index] = response.result === true;

                            // 검증 데이터로 업데이트
                            if (response.result && response.data) {
                                if (response.data.manufacturerName) {
                                    item.extracted_data.manufacturer = response.data.manufacturerName;
                                }
                                if (response.data.description) {
                                    item.extracted_data.description = response.data.description;
                                }
                            }

                            console.log(`검증 완료 [${item.index}]:`, partNumber, response);
                            return { index: item.index, partNumber, response, success: response.result };
                        })
                        .catch((error: any) => {
                            this.verificationResults[item.index] = false;
                            console.error(`검증 실패 [${item.index}]:`, partNumber, error);
                            return { index: item.index, partNumber, error, success: false };
                        });
                });

                await Promise.all(promises);
                this.verificationProgress = Math.min(i + batchSize, items.length);
            }

            this.isVerifying = false;
            this.showVerifyModal = false;
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
