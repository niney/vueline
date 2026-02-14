<template>
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
                                :value="orderSummary.shippingFee"
                                class="w-20 px-2 py-1 rounded-md text-right text-[13px] tabular-nums outline-none transition-colors"
                                :class="darkMode
                                    ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                    : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                min="0"
                                @input="$emit('update:shipping-fee', Number(($event.target as HTMLInputElement).value))"
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
                                :value="orderSummary.managementFee"
                                class="w-20 px-2 py-1 rounded-md text-right text-[13px] tabular-nums outline-none transition-colors"
                                :class="darkMode
                                    ? 'bg-white/[0.06] border border-white/10 text-gray-200 focus:border-blue-500/50'
                                    : 'bg-white border border-gray-200 text-gray-700 focus:border-blue-400'"
                                min="0"
                                @input="$emit('update:management-fee', Number(($event.target as HTMLInputElement).value))"
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
                    @click="$emit('save')"
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
                    @click="$emit('request-quote')"
                >
                    <i class="fas fa-file-invoice mr-1.5"></i> 견적요청
                </button>
                <button
                    class="w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border"
                    :class="darkMode
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/40'
                        : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:border-amber-400 shadow-sm'"
                    @click="$emit('add-to-cart')"
                >
                    <i class="fas fa-shopping-cart mr-1.5"></i> 장바구니
                </button>
            </template>
        </div>
    </aside>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PcbItem, OrderSummaryV2 } from "@/model/sp-smart-bom-params";
import { formatPrice } from "../services";
import StatCard from "./StatCard.vue";

export default defineComponent({
    name: 'OrderPanel',
    components: { StatCard },
    props: {
        darkMode: {
            type: Boolean,
            required: true
        },
        rightPanelOpen: {
            type: Boolean,
            required: true
        },
        pcbItems: {
            type: Array as PropType<PcbItem[]>,
            required: true
        },
        matchedCount: {
            type: Number,
            required: true
        },
        matchedPercent: {
            type: Number,
            required: true
        },
        unmatchedCount: {
            type: Number,
            required: true
        },
        orderSummary: {
            type: Object as PropType<OrderSummaryV2>,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        finalAmount: {
            type: Number,
            required: true
        },
        isEditMode: {
            type: Boolean,
            required: true
        }
    },
    emits: ['request-quote', 'add-to-cart', 'save', 'update:shipping-fee', 'update:management-fee'],
    setup() {
        return { formatPrice };
    }
});
</script>
