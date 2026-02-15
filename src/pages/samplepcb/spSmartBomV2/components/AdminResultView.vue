<template>
    <div>
        <!-- 헤더 -->
        <div class="flex items-center gap-6 mb-5">
            <button
                class="bg-transparent border border-gray-600 cursor-pointer text-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-700 hover:border-gray-700"
                :class="darkMode ? 'text-white' : 'text-gray-900'"
                @click="$emit('go-back')"
            >
                <i class="fas fa-arrow-left"></i> Back
            </button>
            <div class="flex-1">
                <h2 class="text-lg m-0">{{ fileName }}</h2>
                <small :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Admin Mode</small>
            </div>
        </div>

        <!-- 상단 패널 -->
        <AdminOrderPanel
            :dark-mode="darkMode"
            :pcb-items="pcbItems"
            :matched-count="matchedCount"
            :matched-percent="matchedPercent"
            :unmatched-count="unmatchedCount"
            :order-summary="orderSummary"
            :total-amount="totalAmount"
            :final-amount="finalAmount"
            :margin-summary="marginSummary"
            @save="$emit('save')"
            @update:shipping-fee="$emit('update:shipping-fee', $event)"
            @update:management-fee="$emit('update:management-fee', $event)"
            @update:discount="$emit('update:discount', $event)"
            @update:expected-delivery="$emit('update:expected-delivery', $event)"
            @update:memo="$emit('update:memo', $event)"
        />

        <!-- 테이블 -->
        <AdminBomTable
            :pcb-item-list="pcbItemList"
            :dark-mode="darkMode"
            :selected-rows="selectedRows"
            @toggle-select="$emit('toggle-select', $event)"
            @toggle-select-all="$emit('toggle-select-all')"
            @update-qty="$emit('update-qty', $event)"
            @update-price-override="$emit('update-price-override', $event)"
            @reset-price-override="$emit('reset-price-override', $event)"
            @update-package="$emit('update-package', $event)"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { PcbItem, OrderSummaryV2, MarginSummary } from "@/model/sp-smart-bom-params";
import AdminBomTable from "./AdminBomTable.vue";
import AdminOrderPanel from "./AdminOrderPanel.vue";

export default defineComponent({
    name: 'AdminResultView',
    components: { AdminBomTable, AdminOrderPanel },
    props: {
        pcbItemList: { type: Array as PropType<PcbItem[]>, required: true },
        darkMode: { type: Boolean, required: true },
        selectedRows: { type: Object as PropType<Set<number>>, required: true },
        fileName: { type: String, required: true },
        pcbItems: { type: Array as PropType<PcbItem[]>, required: true },
        matchedCount: { type: Number, required: true },
        matchedPercent: { type: Number, required: true },
        unmatchedCount: { type: Number, required: true },
        orderSummary: { type: Object as PropType<OrderSummaryV2>, required: true },
        totalAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
        marginSummary: { type: Object as PropType<MarginSummary>, required: true }
    },
    emits: [
        'go-back',
        'toggle-select', 'toggle-select-all',
        'update-qty', 'update-price-override', 'reset-price-override', 'update-package',
        'save',
        'update:shipping-fee', 'update:management-fee', 'update:discount', 'update:expected-delivery', 'update:memo'
    ]
});
</script>
