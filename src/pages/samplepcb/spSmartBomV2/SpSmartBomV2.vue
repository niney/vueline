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

                <!-- 테이블 -->
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
                                    <tr class="cursor-pointer" @click="toggleRow(index)">
                                        <td @click.stop>
                                            <input
                                                type="checkbox"
                                                class="custom-checkbox"
                                                :checked="selectedRows.has(index)"
                                                :disabled="item.is_pcb !== true"
                                                @change="toggleSelect(index)"
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

                <!-- 오른쪽 패널 (fixed) -->
                <aside
                    v-show="rightPanelOpen"
                    class="right-panel fixed top-[146px] right-6 w-72 max-h-[calc(100vh-140px)] overflow-y-auto flex flex-col gap-3 z-30 p-4 rounded-xl border backdrop-blur-md"
                    :class="darkMode
                        ? 'bg-[#0d1017]/90 border-white/[0.06] shadow-2xl shadow-black/40'
                        : 'bg-white/95 border-gray-200 shadow-xl shadow-gray-300/30'"
                >
                    <!-- 섹션 헤더: Analysis -->
                    <div class="flex items-center gap-2 mb-1">
                        <div class="w-1.5 h-4 rounded-full bg-blue-500"></div>
                        <span
                            class="text-[10px] font-bold tracking-[0.15em] uppercase"
                            :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                        >Analysis</span>
                    </div>

                    <!-- 통계 카드 -->
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

                    <!-- 구분선 -->
                    <div class="my-1">
                        <div class="h-px" :class="darkMode ? 'bg-white/[0.06]' : 'bg-gray-200'"></div>
                    </div>

                    <!-- 단가 및 납기정보 -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-1.5 h-4 rounded-full bg-cyan-500"></div>
                            <span
                                class="text-[10px] font-bold tracking-[0.15em] uppercase"
                                :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                            >Order Info</span>
                        </div>
                        <div
                            class="rounded-lg p-3 space-y-2.5 text-[13px] border"
                            :class="darkMode ? 'bg-white/[0.03] border-white/[0.04]' : 'bg-gray-50/80 border-gray-100'"
                        >
                            <div class="flex justify-between items-center">
                                <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">구매수량</span>
                                <span
                                    class="font-semibold tabular-nums"
                                    :class="darkMode ? 'text-gray-200' : 'text-gray-700'"
                                >1 Set</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">예상납기</span>
                                <span class="inline-flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                                    <span
                                        class="font-semibold"
                                        :class="darkMode ? 'text-cyan-400' : 'text-cyan-600'"
                                    >{{ orderSummary.expectedDelivery }}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 구분선 -->
                    <div class="my-1">
                        <div class="h-px" :class="darkMode ? 'bg-white/[0.06]' : 'bg-gray-200'"></div>
                    </div>

                    <!-- 추정 예상금액 -->
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-1.5 h-4 rounded-full bg-amber-500"></div>
                            <span
                                class="text-[10px] font-bold tracking-[0.15em] uppercase"
                                :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
                            >Estimate</span>
                        </div>

                        <div
                            class="rounded-lg p-3 space-y-2 text-[13px] border"
                            :class="darkMode ? 'bg-white/[0.03] border-white/[0.04]' : 'bg-gray-50/80 border-gray-100'"
                        >
                            <!-- 합계 -->
                            <div class="flex justify-between items-center">
                                <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">합계</span>
                                <span
                                    class="font-semibold tabular-nums"
                                    :class="darkMode ? 'text-gray-200' : 'text-gray-700'"
                                >{{ formatPrice(totalAmount) }}<span class="text-[11px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span></span>
                            </div>

                            <!-- 운송료 -->
                            <div class="flex justify-between items-center">
                                <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">운송료</span>
                                <template v-if="isEditMode">
                                    <div class="flex items-center gap-1">
                                        <input
                                            type="number"
                                            v-model.number="orderSummary.shippingFee"
                                            class="w-20 px-2 py-1 rounded-md text-right text-[13px] tabular-nums outline-none transition-colors"
                                            :class="darkMode
                                                ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                                : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                            min="0"
                                        />
                                        <span class="text-[11px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <span
                                        class="font-semibold tabular-nums"
                                        :class="darkMode ? 'text-gray-200' : 'text-gray-700'"
                                    >{{ formatPrice(orderSummary.shippingFee) }}<span class="text-[11px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span></span>
                                </template>
                            </div>

                            <!-- 구매대행 관리비 -->
                            <div class="flex justify-between items-center">
                                <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">관리비</span>
                                <template v-if="isEditMode">
                                    <div class="flex items-center gap-1">
                                        <input
                                            type="number"
                                            v-model.number="orderSummary.managementFee"
                                            class="w-20 px-2 py-1 rounded-md text-right text-[13px] tabular-nums outline-none transition-colors"
                                            :class="darkMode
                                                ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                                : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                            min="0"
                                        />
                                        <span class="text-[11px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <span
                                        class="font-semibold tabular-nums"
                                        :class="darkMode ? 'text-gray-200' : 'text-gray-700'"
                                    >{{ formatPrice(orderSummary.managementFee) }}<span class="text-[11px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span></span>
                                </template>
                            </div>
                        </div>

                        <!-- 최종합계 (히어로 금액) -->
                        <div
                            class="mt-3 rounded-lg p-3 border"
                            :class="darkMode
                                ? 'bg-gradient-to-br from-blue-500/[0.08] to-indigo-500/[0.04] border-blue-500/15'
                                : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/60'"
                        >
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[11px] font-medium" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                                    최종합계
                                    <span class="text-[10px]" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">(VAT 별도)</span>
                                </span>
                            </div>
                            <div class="text-right">
                                <span
                                    class="text-lg font-bold tabular-nums tracking-tight"
                                    :class="darkMode ? 'text-blue-400' : 'text-blue-600'"
                                >{{ formatPrice(finalAmount) }}</span>
                                <span class="text-xs font-medium ml-0.5" :class="darkMode ? 'text-blue-400/60' : 'text-blue-500/60'">원</span>
                            </div>
                        </div>
                    </div>

                    <!-- 액션 버튼 -->
                    <div class="flex flex-col gap-2 mt-1">
                        <template v-if="isEditMode">
                            <button
                                class="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0"
                                :class="darkMode
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'"
                                @click="handleSave"
                            >
                                <i class="fas fa-save mr-1.5"></i> 저장하기
                            </button>
                        </template>
                        <template v-else>
                            <button
                                class="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0"
                                :class="darkMode
                                    ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/25'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20'"
                                @click="handleRequestQuote"
                            >
                                <i class="fas fa-file-invoice mr-1.5"></i> 견적요청
                            </button>
                            <button
                                class="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border"
                                :class="darkMode
                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/40'
                                    : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 shadow-sm'"
                                @click="handleAddToCart"
                            >
                                <i class="fas fa-shopping-cart mr-1.5"></i> 장바구니
                            </button>
                        </template>
                    </div>
                </aside>
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
            finalAmount: 0
        });

        // URL 파라미터로 편집 모드 확인
        const urlParams = new URLSearchParams(window.location.search);
        isEditMode.value = urlParams.get('mode') === 'edit';

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
            sidebarOpen.value = windowWidth.value >= 768;
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

        const getDesignator = (item: PcbItem) => {
            return item.reference_prefix || item.number?.[0] || '-';
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
            pcbItems, matchedCount, unmatchedCount, matchedPercent, expandedRows, selectedRows,
            navItems, getDesignator, toggleSelect, toggleRow, goBack, handleFileSelect, handleDrop,
            // 가격 관련 (서비스에서 import)
            formatPrice, getPriceOptions, getPriceSteps, updateQty,
            isActiveRange, isActiveSingleRange, isUnderMoq, getMoq, getCalculatedPrice,
            // SelectBox 관련
            getSelectBoxOptions, getSelectedPkgIndex, handlePkgSelect,
            // 주문 요약 관련
            orderSummary, totalAmount, finalAmount, isEditMode,
            handleRequestQuote, handleAddToCart, handleSave,
            // 오른쪽 패널
            rightPanelOpen, windowWidth
        };
    }
});
</script>
