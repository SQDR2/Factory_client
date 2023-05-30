<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.search" clearable placeholder="订单商品/订单编号" class="handle-input mr10"
                    @change="searchOrder" @clear="getAllOrders"></el-input>
                <el-button type="primary" :icon="Search" @click="searchOrder">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="exportExcle">导出Excel</el-button>
            </div>
            <TableCom :Columns="columns" :data="showTable" :headAlign="'center'" :align="'center'">
                <template #o_product="scope">
                    <span v-for="(item, index) in scope.row.o_product">
                        <router-link :to="{ name: 'PDetail', params: { _id: item._id } }">{{ item.name }}</router-link>
                        <span v-if="index !== scope.row.o_product.length - 1">, </span>
                    </span>
                </template>
                <template #o_price="scope">
                    {{ (scope.row.o_price).toLocaleString('zh-CN', options) }}
                </template>
                <template #c_location="scope">
                    {{ CodeToText[scope.row.c_location[0]] + ' ' + CodeToText[scope.row.c_location[1]] + ' ' +
                        CodeToText[scope.row.c_location[2]] }}
                </template>
                <template #status="scope">
                    <el-button :disabled="scope.row.status" :type="scope.row.status ? 'primary' : 'danger'" round
                        @click="changeStatus(scope.row)">{{
                            scope.row.status ? '完成' : '未完成' }}</el-button>
                </template>
                <template #detail="scope">
                    <router-link :to="{ name: 'ODetail', params: { _id: scope.row._id } }">详情</router-link>
                </template>

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
                    :total="tableData.length" @size-change="handleSizeChange"
                    @current-change="handlePageChange"></el-pagination>
            </div>

            <!-- 新增 -->
            <dialogBox :from_item="add_form_item" :FormData="addForm" :card-btn="title" :title="title"
                :dialog-visible="addialogVisible" @cancle="handleCancle" @submit="handleAddBtn">
                <!-- 订单商品 -->
                <template #o_product>
                    <el-select v-model="addForm.o_product" multiple collapse-tags placeholder="请选择订单产品" style="width: 240px"
                        clearable>
                        <el-option v-for="item in products" :key="item._id" :label="item.name" :value="item._id" />
                    </el-select>
                </template>
                <!-- 订单价格 -->
                <template #o_price>
                    <el-input v-model.number="addForm.o_price" :value="addForm.o_price === 0 ? '' : addForm.o_price"
                        type="number" :min="0" :step="1" placeholder="请输入订单价格">
                        <template #append>总价</template>
                    </el-input>
                </template>
                <!-- 订单地址 -->
                <template #c_location>
                    <el-cascader :options='regionData' v-model='addForm.c_location'></el-cascader>
                </template>
                <!-- 订单数量 -->
                <template #quantity>
                    <el-input class="quantityInput" v-if="addForm.o_product.length == 0" placeholder="请输入产品的数量"></el-input>
                    <el-input class="quantityInput" v-for="(item, index) in addForm.o_product" :key="item"
                        v-model.number="addForm.quantity[index]" :placeholder="`请输入第${index + 1}位产品的数量`" :min="0" :step="1"
                        type="number"></el-input>
                </template>
            </dialogBox>

            <!--编辑数据 -->
            <dialogBox :title="title" :from_item="edit_form_item" :FormData="editForm" :card-btn="title"
                :dialog-visible="editdialogVisible" @cancle="handleCancle" @submit="handleEditBtn">
                <!-- 订单商品 -->
                <template #o_product>
                    <el-select v-model="editForm.o_product" multiple collapse-tags placeholder="请选择订单产品"
                        style="width: 240px" clearable>
                        <el-option v-for="item in products" :key="item._id" :label="item.name" :value="item._id" />
                    </el-select>
                </template>
                <!-- 订单价格 -->
                <template #o_price>
                    <el-input v-model.number="editForm.o_price" :value="editForm.o_price === 0 ? '' : editForm.o_price"
                        type="number" :min="0" :step="1" placeholder="请输入订单价格">
                        <template #append>总价</template>
                    </el-input>
                </template>
                <!-- 订单地址 -->
                <template #c_location>
                    <el-cascader :options='regionData' v-model='editForm.c_location'></el-cascader>
                </template>
                <!-- 订单数量 -->
                <template #quantity>
                    <el-input class="quantityInput" v-if="editForm.o_product.length == 0" placeholder="请输入产品的数量"></el-input>
                    <el-input class="quantityInput" v-for="(item, index) in editForm.o_product" :key="item"
                        v-model.number="editForm.quantity[index]" :placeholder="`请输入第${index + 1}位产品的数量`" :min="0" :step="1"
                        type="number"></el-input>
                </template>
            </dialogBox>
        </div>
    </div>
</template>
<script setup lang="ts" >
import { ref, reactive, onMounted, Ref } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import { regionData, CodeToText } from 'element-china-area-data'
import TableCom from '../../components/TbaleCom.vue';
import dialogBox from '../../components/dialogBox.vue';
import { getOrders, addOrder, deleteOrder, getSpecific, editOrder } from '../../api/order'
import { getProducts } from '../../api/product'
import ExportExcle from '../../utils/ExportExcle'

//表格数据
interface TableItem {
    _id?: string,
    o_product: any,
    o_price: number,
    customer: string,
    c_location: string[],
    quantity: number[],
    createdAt?: string
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
    disabled?: boolean
}
// 还可以加参数，进行更优雅的做法
const options = {
    style: 'currency',
    currency: 'CNY',
};
const columns: Column[] = [
    {
        label: '订单编号',
        prop: '_id',
        width: '220'
    }, {
        label: '订单产品',
        // prop:'o_product',
        // width: "120",
        slotName: 'o_product'
    }, {
        label: '订单价格',
        // prop: 'o_price',
        slotName: 'o_price',
        width: "100"
    }, {
        label: '客户名称',
        prop: 'customer',
        width: '100'
    }, {
        label: '订单所在地',
        slotName: "c_location",
        width: "180"
    },
    // {
    //     label: '数量',
    //     prop: 'quantity',
    //     width: "80"
    // },
    {
        label: '状态',
        slotName: "status",
        width: "100"
    }, {
        label: '详情',
        slotName: "detail",
        width: "80"
    },
    {
        label: '操作',
        width: '230',
        slotName: 'operate'
    }
]
//表单搜索数据
const query = reactive({
    search: '',
    pageIndex: 1,
    pageSize: 7
})

//编辑和新增弹窗
let editdialogVisible: Ref<boolean> = ref(false);
let addialogVisible: Ref<boolean> = ref(false);
const title = ref('')
//全部表格数据和展示表格数据
const tableData = ref<TableItem[]>([]);
const showTable = ref<TableItem[]>([])
//全部产品
const products: any = ref([])
//新增弹窗绑定的表单数据
const addForm = ref<TableItem>({
    o_product: [],
    o_price: 0,
    customer: '',
    c_location: [],
    quantity: []
})
//编辑弹窗所绑定的表单数据
const editForm = ref<TableItem>({
    o_product: [],
    o_price: 0,
    customer: '',
    c_location: [],
    quantity: []
})
//表单每一项
const edit_form_item: FormItem[] = [
    {
        label: '订单产品',
        // prop: 'o_product'
        slotName: 'o_product',
    }, {
        label: '订单价格',
        slotName: 'o_price',
        // prop: 'o_price'
    }, {
        label: '客户名称',
        // slotName: "customer",
        prop: "customer"
    }, {
        label: '订单所在地',
        slotName: 'c_location'
    }, {
        label: '订单数量',
        slotName: 'quantity'
    }
]
const add_form_item: FormItem[] = [
    {
        label: '订单产品',
        // prop: 'o_product'
        slotName: 'o_product',
    }, {
        label: '订单价格',
        slotName: 'o_price',
        // prop: 'o_price'
    }, {
        label: '客户名称',
        // slotName: "customer",
        prop: "customer"
    }, {
        label: '订单所在地',
        slotName: 'c_location'
    }, {
        label: '订单数量',
        slotName: 'quantity'
    }
]

//获取全部订单
const getAllOrders = (name: string | undefined = undefined) => {
    getOrders(name).then(res => {
        console.log(res);
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize)
    })
}
// 点击其他页
const handlePageChange = (val: number) => {
    showTable.value = tableData.value.slice((query.pageSize * (val - 1)), (query.pageSize * (val)))
}
//分页数量改变
const handleSizeChange = (val: number) => {
    showTable.value = tableData.value.slice(0, val)
}

//删除管理员
const handleDelete = (_id: string) => {
    // 二次确认删除
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            deleteOrder(_id).then(res => {
                console.log(res);
                getAllOrders()
                query.pageIndex = 1
                ElMessage.success(res.msg)
            }).catch(err => {
                console.log(err);
                ElMessage.error(err.msg)
            })
        })
}

//点击新增按钮
const handleAdd = () => {
    title.value = '新增'
    getProducts().then(res => {
        products.value = res.data
    }).catch(err => console.log(err))
    addialogVisible.value = true
}


//确认新增
const handleAddBtn = () => {
    console.log(addForm.value)
    addOrder(addForm.value).then(res => {
        ElMessage.success(res.msg)
        getAllOrders()
        query.pageIndex = 1
        addialogVisible.value = false
    })
}

//点击取消
const handleCancle = () => {
    if (title.value === '新增') {
        addialogVisible.value = false
        addForm.value = { o_product: [], o_price: 0, customer: '', c_location: [], quantity: [] }
    } else if (title.value === '编辑') {
        editdialogVisible.value = false
        editForm.value = { o_product: [], o_price: 0, customer: '', c_location: [], quantity: [] }
    }
}

//点击每一行的编辑按钮
const handleEdit = (row: any) => {
    title.value = '编辑'
    editForm.value = { ...row }
    editForm.value.o_product = editForm.value.o_product.map((item: any) => item._id)
    getProducts().then(res => {
        products.value = res.data
    }).catch(err => console.log(err))
    editdialogVisible.value = true
}
const changeStatus = (row: any) => {
    if (row.status) {
        return ElMessage.info('当前订单已完成')
    } else {
        ElMessageBox.confirm('该订单确定已完成？', '提示', {
            type: 'warning',
        })
            .then(() => {
                editOrder(row._id, { status: true }).then(res => {
                    ElMessage.success(res.msg + '当前订单以设置为完成状态！')
                    query.pageIndex = 1
                    getAllOrders()
                })
            })

    }
}

const edit = () => {
    editOrder(editForm.value._id, editForm.value).then(res => {
        ElMessage.success(res.msg)
        editForm.value = { o_product: [], o_price: 0, customer: '', c_location: [], quantity: [] }
        getAllOrders()
        query.pageIndex = 1
        editdialogVisible.value = false
    }).catch(err => {
        ElMessage.error(err.msg)
    })
}
//确定编辑
const handleEditBtn = () => {
    let o_product = editForm.value.o_product
    let quantity = editForm.value.quantity
    if (o_product.length < quantity.length) {
        editForm.value.quantity.splice(o_product.length, quantity.length - o_product.length)
        edit()
    } else if (o_product.length > quantity.length) {
        ElMessage.error('当前商品数量输入有问题!')
    } else {
        edit()
    }

}
//搜索产品
const searchOrder = () => {
    if (query.search === '') {
        query.pageIndex = 1
        getAllOrders()
    } else if (query.search.length === 24) {
        getOrders(query.search).then(res => {
            tableData.value = res.data
            showTable.value = tableData.value.slice(0, query.pageSize)
        })
    } else {
        getProducts(query.search).then(res => {
            tableData.value = []
            let keys = res.data.map((item: any) => item._id)
            getSpecific(keys).then(res => {
                query.pageIndex = 1
                tableData.value = res.data
                showTable.value = tableData.value.slice(0, query.pageSize)
            })
        })
    }
}

const exportExcle = () => {
    ExportExcle(tableData,
     ['序号','订单编号','订单商品', '订单价格', '客户', '订单所在地', '产品数量', '订单状态（是否完成） ', '完成时间', '创建时间'], '订单表',
     ['_id','o_product','o_price','customer','c_location','quantity','status','iscomplete','createdAt'])
}
onMounted(() => {
    getAllOrders()
})
</script>
<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
}

.table {
    width: 100%;
    font-size: 14px;
}

.red {
    color: #f56c6c;
}

.mr10 {
    margin-right: 10px;
}

.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}

.quantityInput {
    margin-bottom: 10px;
}
</style>