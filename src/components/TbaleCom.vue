<template>
    <el-table :data="data" border class="table" ref="multipleTable" header-cell-class-name="table-header"
        @expand-change="(row: any, expanded: any) => onExpandChange(row, expanded)" :cell-style="{ textAlign: 'center' }"
       :header-cell-style="{ 'text-align': 'center' }">
        <el-table-column :header-align="headAlign" :align="align" :type="item.type" v-for="item in Columns"
            :prop="item.prop" :label="item.label" :width="item.width" >
            <template v-if="item.slotName" #default="{ row }">
                <slot :name="item.slotName" :row="row"></slot>
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup lang="ts">
//表格绑定的全部数据类型
interface TableItem {
    [key: string]: any
}
//表格列
interface Column {
    label: string,
    prop?: string,
    width?: string,
    slotName?: string,
    type?: string
}
// 接收父组件传来的
defineProps<{
    //表格属性
    data: TableItem[],
    // table的列数与属性
    Columns: Column[],
    //是否表头居中
    headAlign: string,
    //文本是否居中
    align: string
}>();

const emits = defineEmits(['onExpandChange']);
const onExpandChange = (row: any, expanded: any) => {
    emits('onExpandChange', row, expanded)
}
</script>

