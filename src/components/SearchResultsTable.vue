<template>
    <ProductTable 
        :pcbItems="pcbItems"
        :selectAll="selectAll"
        :isEditMode="isEditMode"
        :showHighlights="true"
        :showCartButton="showCartButton"
        :showSelectButton="showSelectButton"
        @update:pcbItems="$emit('update:pcbItems', $event)"
        @addToCart="$emit('addToCart', $event)"
        @selectItem="$emit('selectItem', $event)" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PcbItem } from "@/model/sp-smart-bom-params";
import ProductTable from '@/components/ProductTable.vue';

export default defineComponent({
    name: 'SearchResultsTable',
    components: { ProductTable },
    props: {
        pcbItems: {
            type: Array as () => PcbItem[],
            required: true
        },
        selectAll: {
            type: Boolean,
            default: false
        },
        isEditMode: {
            type: Boolean,
            default: false
        },
        showCartButton: {
            type: Boolean,
            default: true
        },
        showSelectButton: {
            type: Boolean,
            default: false
        }
    },
    emits: ['addToCart', 'update:pcbItems', 'selectItem']
});
</script>

<style lang="scss" scoped>
.package-item-alt {
    display: flex;
    gap: 5px;
    font-size: 0.9em;
}

.price-info-alt {
    flex-wrap: wrap;
    gap: 10px;

    .price-tier {
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        flex: 1;
        min-width: 200px;

        &:last-child {
            margin-bottom: 0;
        }

        .price-steps {
            display: flex;
            flex-wrap: wrap;
            font-size: 13px;

            .step {
                font-size: 0.9em;
                padding: 0.2rem 0.5rem;
                color: #495057;
                white-space: nowrap;
                margin-bottom: 5px;

                @media screen and (min-width: 768px) {
                    .price-tier:has(.price-steps .step:nth-child(n+6)) & {
                        flex: 0 1 auto;
                    }
                }
            }
        }
    }
}

.active-price-range-alt {
    background-color: rgba(72, 187, 120, 0.1);
    border-left: 3px solid #48bb78;
    font-weight: bold;
    padding-left: 5px;
    border-radius: 3px;
}
</style>