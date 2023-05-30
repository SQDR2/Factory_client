<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.search" clearable placeholder="供应商名称" class="handle-input mr10"
                    @change="searchSupplier" @clear="clear"></el-input>
                <el-button type="primary" :icon="Search" @click="searchSupplier">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="exportExcle">导出Excel</el-button>
            </div>
            <TableCom :Columns="columns" :data="showTable" :headAlign="'center'" :align="'center'">
                <!-- 地址 -->
                <template #location="scope">
                    {{ CodeToText[scope.row.location[0]] + ' ' + CodeToText[scope.row.location[1]] + ' ' +
                        CodeToText[scope.row.location[2]] }}
                </template>
                <!-- 产品列表 -->
                <template #products="scope">
                    <div class="slProduct" v-if="scope.row.sl_product.length === 0">
                        暂无产品！
                    </div>
                    <div v-else>
                        <div class="slProduct" v-for="item in scope.row.sl_product" :key="item.id">
                            <el-image class="table-td-thumb" :src="item.img_url[0]" :z-index="100"
                                :preview-src-list="[item.img_url]" preview-teleported>
                            </el-image>
                            <span class="product_name">{{ item.name }}</span>
                        </div>
                    </div>
                </template>
                <!-- 操作 -->
                <template #operate="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)">
                        编辑
                    </el-button>
                    <el-button text :icon="Delete" class="red" @click="handleDelete(scope.row._id)">
                        删除
                    </el-button>
                </template>
            </TableCom>
            <div class="pagination">
                <el-pagination v-model:current-page="query.pageIndex" v-model:page-size="query.pageSize"
                    :page-sizes="[7, 10, 15, 20]" background layout="total, sizes, prev, pager, next, jumper"
                    :total="tableData.length" @size-change="handleSizeChange" @current-change="handlePageChange"></el-pagination>
            </div>

            <!-- 新增供应商弹出框 -->
            <dialogBox :from_item="form_item" :FormData="addForm" :cardBtn="title" :title="title"
                :dialogVisible="addialogVisible" @cancle="handleCancle" @submit="DefiniteAdd">
                <!-- 联系地址 -->
                <template #location>
                    <el-cascader :options='regionData' v-model='addForm.location' @change='addressChange'></el-cascader>
                </template>
                <!-- 产品 -->
                <template #sl_product>
                    <el-select v-model="addForm.sl_product" multiple collapse-tags placeholder="Select"
                        style="width: 240px">
                        <el-option v-for="item in products" :key="item._id" :label="item.name" :value="item._id" />
                    </el-select>
                </template>
            </dialogBox>

            <dialogBox :from_item="form_item" :FormData="editForm" :cardBtn="title" :title="title"
                :dialogVisible="editdialogVisible" @cancle="handleCancle" @submit="DefiniteEdit">
                <!-- 联系地址 -->
                <template #location>
                    <el-cascader :options='regionData' v-model='editForm.location' @change='addressChange'></el-cascader>
                </template>
                <!-- 产品 -->
                <template #sl_product>
                    <el-select v-model="editForm.sl_product" multiple collapse-tags placeholder="Select"
                        style="width: 240px">
                        <el-option v-for="item in products" :key="item._id" :label="item.name" :value="item._id" />
                    </el-select>
                </template>
            </dialogBox>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Edit, Delete, Search, Plus } from '@element-plus/icons-vue';
import { onMounted, reactive, Ref, ref } from 'vue';
import { regionData, CodeToText } from 'element-china-area-data'
import TableCom from '../../components/TbaleCom.vue';
import dialogBox from '../../components/dialogBox.vue';
import { getSupplier, addSupplier, deleteSupplier, updateSupplier } from '../../api/supplier';
import { getProducts } from '../../api/product'
import { ElMessage, ElMessageBox } from 'element-plus';
import ExportExcle from '../../utils/ExportExcle';

interface TableItem {
    _id?: string,
    name: string,
    phone: string,
    location: any,
    sl_product: any
}
//表格列
interface Column {
    label: string,
    prop?: string,
    width?: string,
    slotName?: string,
    type?: string
}
//表单每一项类型
interface FormItem {
    label: string,
    prop?: string,
    slotName?: string,
}
const columns: Column[] = [
    {
        label: '供应商',
        prop: 'name',
        // width: '120'
    },
    {
        label: '联系方式',
        prop: 'phone',
        // width: '120'
    },
    {
        label: '地址',
        // prop: 'location',
        // width: '120'
        slotName: 'location'
    },
    {
        label: '产品',
        slotName: 'products',
        width: "130",
        type: 'expand'
    },
    {
        label: '操作',
        // width: '250',
        slotName: 'operate'
    }
]
//全部表格数据和展示表格数据
const tableData = ref<TableItem[]>([]);
const showTable = ref<TableItem[]>([])
//新增框和修改框
let editdialogVisible: Ref<boolean> = ref(false);
let addialogVisible: Ref<boolean> = ref(false);
//弹出框的title
const title: Ref<string> = ref('')
//表单搜索数据
const query = reactive({
    search: '',
    pageIndex: 1,
    pageSize: 7
})
//新增表单信息
const addForm = ref<TableItem>({
    name: "",
    phone: "",
    location: ['', '', ''],
    sl_product: []
})
//修改供应商表单信息
const editForm = ref<TableItem>({
    name: "",
    phone: "",
    location: ['', '', ''],
    sl_product: []
})
//全部产品
const products: any = ref([])
//新增表单的每一项
const form_item: FormItem[] = [
    {
        label: '名称',
        prop: 'name'
    },
    {
        label: '联系方式',
        prop: 'phone'
        // slotName: 'name',
    }, {
        label: '联系地址',
        slotName: 'location'
        // prop: 'location'
    }, {
        label: '产品',
        slotName: "sl_product"
    }
]
// 点击其他页
const handlePageChange = (val: number) => {
    showTable.value = tableData.value.slice((query.pageSize * (val - 1)), (query.pageSize * (val)))
}
//分页数量改变
const handleSizeChange = (val: number) => {
    showTable.value = tableData.value.slice(0, val)
}

//点击删除
const handleDelete = (_id: string) => {
    // 二次确认删除
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
    }).then(() => {
        deleteSupplier(_id).then(res => {
            ElMessage.success(res.msg)
            getAllSupplier()
            console.log(res);
        }).catch(err => {
            console.log(err);
        })
    })

}
//点击修改按钮弹出修改框
const handleEdit = (supplier: any) => {
    title.value = '编辑'
    getProducts().then(res => {
        products.value = res.data
    }).catch(err => console.log(err))
    editForm.value = { ...supplier }
    editForm.value.sl_product = editForm.value.sl_product.map((item: any) => {
        return item._id
    })

    editdialogVisible.value = true
}
//确定修改供应商
const DefiniteEdit = () => {
    editForm.value.sl_product = [...new Set(editForm.value.sl_product)]
    updateSupplier(editForm.value._id, editForm.value).then(res => {
        ElMessage.success(res.msg)
        getAllSupplier()
        editdialogVisible.value = false
    }).catch(err => {
        ElMessage.error(err.msg)
        editdialogVisible.value = false
    })
}
//地址选择
const addressChange = (arr: any) => {
    console.log(addForm.value.location)
    // console.log(arr)
    console.log(CodeToText[arr[0]], CodeToText[arr[1]], CodeToText[arr[2]])
}
//点击新增供应商按钮弹出新增框
const handleAdd = () => {
    title.value = '新增';
    getProducts().then(res => {
        products.value = res.data
    }).catch(err => console.log(err))
    addialogVisible.value = true;
}
//取消弹出
const handleCancle = () => {
    if (title.value === '新增') {
        addialogVisible.value = false
    } else if (title.value === '编辑') {
        editdialogVisible.value = false
    }
}
//确定添加供应商
const DefiniteAdd = () => {
    console.log(addForm.value);
    addSupplier(addForm.value).then(res => {
        ElMessage.success(res.msg)
        getAllSupplier()
        addForm.value = {
            name: "",
            phone: "",
            location: ['', '', ''],
            sl_product: []
        }
        addialogVisible.value = false
    })


}
//获取全部归供应商相关信息
const getAllSupplier = () => {
    getSupplier().then(res => {
        console.log(res)
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize)
    })
}
//搜索供应商
const searchSupplier = () => {
    getSupplier(query.search).then(res => {
        console.log(res);
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize)
    }).catch(err=>{
        ElMessage.error(err.msg)
    })
}
//清空搜索框
const clear = () => {
    getAllSupplier()
}

const exportExcle = () => {
    ExportExcle(tableData,
     ['序号','供应商名称', '联系方式', '地址', '供应产品'], '供应商表',
     ['name','phone','location','sl_product'])
}
onMounted(() => {
    getAllSupplier()
})
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}



.handle-input {
    width: 300px;
}

.red {
    color: #F56C6C;
}

.mr10 {
    margin-right: 10px;
}

.table-td-thumb {
    width: 40px;
    height: 40px;
}

.slProduct {
    display: flex;
    align-items: center;
    margin: 5px 50px;
}

.product_name {
    margin-left: 25px;
}
</style>
