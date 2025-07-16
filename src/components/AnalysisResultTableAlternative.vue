<template>
    <ProductTable 
        :pcbItems="pcbItems as any"
        :selectAll="selectAll"
        :isEditMode="isEditMode"
        :hasCheckbox="true"
        :showRowIndex="true"
        :showReference="true"
        :showValues="true"
        :showChangeButton="true"
        @update:selectAll="$emit('update:selectAll', $event)"
        @update:pcbItems="$emit('update:pcbItems', $event)"
        @changeItem="(item, index) => $emit('changeItem', item, index)" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAnalysisTableComposable } from '@/composables/useAnalysisTable';
import ProductTable from '@/components/ProductTable.vue';

export default defineComponent({
    name: 'AnalysisResultTableAlternative',
    components: { ProductTable },
    props: useAnalysisTableComposable.props,
    emits: ['update:selectAll', 'update:pcbItems', 'changeItem'],
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

        .quantity-select {
            select {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #ced4da;
                border-radius: 4px;
                background-color: #fff;
                font-size: 0.9em;

                &:focus {
                    outline: none;
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
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
