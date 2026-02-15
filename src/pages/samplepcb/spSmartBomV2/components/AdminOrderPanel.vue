<template>
    <div
        class="admin-top-panel rounded-xl border mb-5"
        :class="darkMode
            ? 'bg-[#0d1017]/70 border-white/[0.06]'
            : 'bg-white/95 border-gray-200 shadow-sm'"
    >
        <!-- 상단 행: Analysis + Margin + Estimate 요약 -->
        <div class="grid grid-cols-[1fr_1fr_2fr] gap-0">

            <!-- Analysis -->
            <div class="p-4 border-r" :class="darkMode ? 'border-white/[0.06]' : 'border-gray-200'">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-1.5 h-4 rounded-full bg-blue-500"></div>
                    <span class="text-[10px] font-bold tracking-[0.15em] uppercase" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Analysis</span>
                </div>
                <div class="flex gap-3">
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-white/[0.03] border-white/[0.04]' : 'bg-gray-50 border-gray-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Total</div>
                        <div class="text-lg font-bold tabular-nums" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ pcbItems.length }}</div>
                    </div>
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-emerald-500/[0.05] border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Matched</div>
                        <div class="flex items-baseline justify-center gap-1">
                            <span class="text-lg font-bold tabular-nums" :class="darkMode ? 'text-emerald-400' : 'text-emerald-600'">{{ matchedCount }}</span>
                            <span class="text-[11px] tabular-nums" :class="darkMode ? 'text-emerald-400/60' : 'text-emerald-500/70'">{{ matchedPercent }}%</span>
                        </div>
                    </div>
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-rose-500/[0.05] border-rose-500/10' : 'bg-rose-50/50 border-rose-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Unmatched</div>
                        <div class="text-lg font-bold tabular-nums" :class="darkMode ? 'text-rose-400' : 'text-rose-600'">{{ unmatchedCount }}</div>
                    </div>
                </div>
            </div>

            <!-- Margin Info -->
            <div class="p-4 border-r" :class="darkMode ? 'border-white/[0.06]' : 'border-gray-200'">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-1.5 h-4 rounded-full bg-emerald-500"></div>
                    <span class="text-[10px] font-bold tracking-[0.15em] uppercase" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Margin</span>
                </div>
                <div class="flex gap-3">
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-white/[0.03] border-white/[0.04]' : 'bg-gray-50 border-gray-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원가</div>
                        <div class="text-sm font-bold tabular-nums" :class="darkMode ? 'text-gray-200' : 'text-gray-700'">
                            {{ formatPrice(marginSummary.totalCost) }}<span class="text-[10px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                        </div>
                    </div>
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-emerald-500/[0.04] border-emerald-500/10' : 'bg-emerald-50/30 border-emerald-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">마진액</div>
                        <div class="text-sm font-bold tabular-nums" :class="marginSummary.totalMargin >= 0 ? 'text-emerald-400' : 'text-red-400'">
                            {{ marginSummary.totalMargin >= 0 ? '+' : '' }}{{ formatPrice(marginSummary.totalMargin) }}<span class="text-[10px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                        </div>
                    </div>
                    <div
                        class="flex-1 rounded-lg px-3 py-2 text-center border"
                        :class="darkMode ? 'bg-white/[0.03] border-white/[0.04]' : 'bg-gray-50 border-gray-100'"
                    >
                        <div class="text-[10px] font-semibold tracking-wider uppercase mb-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">마진율</div>
                        <div class="text-sm font-bold tabular-nums" :class="getMarginColorClass(marginSummary.marginPercent)">
                            {{ marginSummary.marginPercent.toFixed(1) }}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estimate + Order Info -->
            <div class="p-4">
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-1.5 h-4 rounded-full bg-amber-500"></div>
                    <span class="text-[10px] font-bold tracking-[0.15em] uppercase" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Estimate</span>
                </div>
                <div class="flex items-start gap-4">
                    <!-- 비용 입력 그리드 -->
                    <div class="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
                        <!-- 합계 -->
                        <div class="flex justify-between items-center">
                            <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">합계</span>
                            <span class="font-semibold tabular-nums" :class="darkMode ? 'text-gray-200' : 'text-gray-700'">
                                {{ formatPrice(totalAmount) }}<span class="text-[10px] font-normal ml-0.5" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                            </span>
                        </div>
                        <!-- 예상납기 -->
                        <div class="flex justify-between items-center">
                            <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">예상납기</span>
                            <input
                                type="text"
                                :value="orderSummary.expectedDelivery"
                                class="w-16 px-2 py-0.5 rounded text-right text-[13px] outline-none transition-colors"
                                :class="darkMode
                                    ? 'bg-white/[0.06] border border-white/10 text-cyan-400 focus:border-cyan-500/50'
                                    : 'bg-white border border-gray-200 text-cyan-600 focus:border-cyan-400'"
                                @input="$emit('update:expected-delivery', ($event.target as HTMLInputElement).value)"
                            />
                        </div>
                        <!-- 운송료 -->
                        <div class="flex justify-between items-center">
                            <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">운송료</span>
                            <div class="flex items-center gap-1">
                                <input
                                    type="number"
                                    :value="orderSummary.shippingFee"
                                    class="w-20 px-2 py-0.5 rounded text-right text-[13px] tabular-nums outline-none transition-colors"
                                    :class="darkMode
                                        ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                        : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                    min="0"
                                    @input="$emit('update:shipping-fee', Number(($event.target as HTMLInputElement).value))"
                                />
                                <span class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                            </div>
                        </div>
                        <!-- 관리비 -->
                        <div class="flex justify-between items-center">
                            <span :class="darkMode ? 'text-gray-500' : 'text-gray-400'">관리비</span>
                            <div class="flex items-center gap-1">
                                <input
                                    type="number"
                                    :value="orderSummary.managementFee"
                                    class="w-20 px-2 py-0.5 rounded text-right text-[13px] tabular-nums outline-none transition-colors"
                                    :class="darkMode
                                        ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                        : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                    min="0"
                                    @input="$emit('update:management-fee', Number(($event.target as HTMLInputElement).value))"
                                />
                                <span class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                            </div>
                        </div>
                        <!-- 할인 -->
                        <div class="flex justify-between items-center">
                            <span :class="darkMode ? 'text-red-400/70' : 'text-red-500/70'">할인</span>
                            <div class="flex items-center gap-1">
                                <input
                                    type="number"
                                    :value="orderSummary.discount || 0"
                                    class="w-20 px-2 py-0.5 rounded text-right text-[13px] tabular-nums outline-none transition-colors"
                                    :class="darkMode
                                        ? 'bg-white/[0.06] border border-white/10 text-red-400 focus:border-red-500/50'
                                        : 'bg-white border border-gray-200 text-red-600 focus:border-red-400'"
                                    min="0"
                                    @input="$emit('update:discount', Number(($event.target as HTMLInputElement).value))"
                                />
                                <span class="text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">원</span>
                            </div>
                        </div>
                    </div>

                    <!-- 구분선 -->
                    <div class="w-px self-stretch" :class="darkMode ? 'bg-white/[0.06]' : 'bg-gray-200'"></div>

                    <!-- 최종합계 + 저장 -->
                    <div class="shrink-0 w-48 flex flex-col gap-2.5">
                        <div
                            class="rounded-lg p-3 border"
                            :class="darkMode
                                ? 'bg-gradient-to-br from-blue-500/[0.08] to-indigo-500/[0.04] border-blue-500/15'
                                : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200/60'"
                        >
                            <div class="text-[10px] font-medium mb-1" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                                최종합계 <span :class="darkMode ? 'text-gray-600' : 'text-gray-400'">(VAT 별도)</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xl font-bold tabular-nums tracking-tight" :class="darkMode ? 'text-blue-400' : 'text-blue-600'">
                                    {{ formatPrice(finalAmount) }}
                                </span>
                                <span class="text-xs font-medium ml-0.5" :class="darkMode ? 'text-blue-400/60' : 'text-blue-500/60'">원</span>
                            </div>
                        </div>
                        <button
                            class="w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0"
                            :class="darkMode
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'"
                            @click="$emit('save')"
                        >
                            <i class="fas fa-save mr-1.5"></i> 저장하기
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 하단 행: Memo (접이식) -->
        <div
            v-if="memoOpen"
            class="border-t px-4 py-3"
            :class="darkMode ? 'border-white/[0.06]' : 'border-gray-200'"
        >
            <div class="flex items-start gap-3">
                <div class="flex items-center gap-2 shrink-0 pt-1.5">
                    <div class="w-1.5 h-4 rounded-full bg-gray-500"></div>
                    <span class="text-[10px] font-bold tracking-[0.15em] uppercase" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">Memo</span>
                </div>
                <textarea
                    :value="orderSummary.memo || ''"
                    class="flex-1 px-3 py-1.5 rounded-lg text-[13px] resize-none outline-none transition-colors"
                    :class="darkMode
                        ? 'bg-white/[0.03] border border-white/[0.06] text-gray-200 placeholder-gray-600 focus:border-blue-500/30'
                        : 'bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:border-blue-400'"
                    placeholder="고객 메모 또는 특이사항..."
                    rows="2"
                    @input="$emit('update:memo', ($event.target as HTMLTextAreaElement).value)"
                ></textarea>
                <button
                    class="shrink-0 p-1 border-0 bg-transparent cursor-pointer mt-1"
                    :class="darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                    @click="memoOpen = false"
                >
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        </div>
        <div
            v-else
            class="border-t px-4 py-1.5 flex justify-center"
            :class="darkMode ? 'border-white/[0.06]' : 'border-gray-200'"
        >
            <button
                class="text-[11px] border-0 bg-transparent cursor-pointer transition-colors"
                :class="darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'"
                @click="memoOpen = true"
            >
                <i class="fas fa-pen text-[9px] mr-1"></i>메모 {{ orderSummary.memo ? '(작성됨)' : '추가' }}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { PcbItem, OrderSummaryV2, MarginSummary } from "@/model/sp-smart-bom-params";
import { formatPrice } from "../services";

export default defineComponent({
    name: 'AdminOrderPanel',
    props: {
        darkMode: { type: Boolean, required: true },
        pcbItems: { type: Array as PropType<PcbItem[]>, required: true },
        matchedCount: { type: Number, required: true },
        matchedPercent: { type: Number, required: true },
        unmatchedCount: { type: Number, required: true },
        orderSummary: { type: Object as PropType<OrderSummaryV2>, required: true },
        totalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
        marginSummary: { type: Object as PropType<MarginSummary>, required: true }
    },
    emits: ['save', 'update:shipping-fee', 'update:management-fee', 'update:discount', 'update:expected-delivery', 'update:memo'],
    setup() {
        const memoOpen = ref(false);

        const getMarginColorClass = (percent: number): string => {
            if (percent < 0) return 'text-red-500';
            if (percent < 10) return 'text-red-400';
            if (percent < 20) return 'text-amber-400';
            return 'text-emerald-400';
        };

        return { memoOpen, formatPrice, getMarginColorClass };
    }
});
</script>
