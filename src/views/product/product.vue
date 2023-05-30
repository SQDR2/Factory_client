<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.search" clearable placeholder="产品名称" class="handle-input mr10"
                    @change="searchProduct" @clear="getAllProduct"></el-input>
                <el-button type="primary" :icon="Search" @click="searchProduct">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
                <el-button type="primary" @click="exportExcle">导出Excel</el-button>
            </div>
            <TableCom :Columns="columns" :data="showTable" :headAlign="'center'" :align="'center'">
                <!-- 产品图片 -->
                <template #img_url="scope">
                    <el-image class="table-td-thumb" :src="scope.row.img_url[0]" :z-index="100"
                        :preview-src-list="[scope.row.img_url[0]]" preview-teleported>
                    </el-image>
                </template>
                <!-- 详情 -->
                <template #detail="scope">
                    <router-link :to="{ name: 'PDetail', params: { _id: scope.row._id } }">详情</router-link>
                </template>
                <!-- 供应商 -->
                <template #supplier_id="scope">
                    {{ scope.row.supplier_id ? scope.row.supplier_id.name : '暂无供应商' }}
                </template>
                <!-- 操作 -->
                <template #operate="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)" v-permiss="15">
                        编辑
                    </el-button>
                    <el-button text :icon="Delete" class="red" @click="handleDelete(scope.row._id)" v-permiss="16">
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
            <!-- 新增产品 -->
            <dialogBox :from_item="add_form_item" :FormData="addForm" :card-btn="title" :title="title"
                :dialog-visible="addialogVisible" @cancle="handleCancle" @submit="handleAddBtn">
                <template #price>
                    <el-input v-model.number="addForm.price" :value="addForm.price === 0 ? '' : addForm.price" type="number"
                        :min="0" :step="1" placeholder="请输入产品单价">
                        <template #append>/ 件</template>
                    </el-input>
                </template>
                <!-- 所属供应商 -->
                <template #supplier_id>
                    <el-select v-model="addForm.supplier_id" class="m-2" placeholder="请选择供应商">
                        <el-option v-for="item in supplier_options" :key="item?._id" :label="item?.name"
                            :value="item?._id" />
                    </el-select>
                </template>
                <!--图片上传功能  -->
                <template #img_url>
                    <el-upload class="upload-demo" :action="uploadUrl" :headers="uploadHearders" :on-change="handleChange"
                        :before-upload="beforeAvatarUpload" :on-success="uploadSuccess" :auto-upload="true">
                        <el-button type="primary">选择图片</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                选择图片即可立即上传！
                            </div>
                        </template>
                    </el-upload>
                </template>
            </dialogBox>

            <!-- 编辑 -->
            <dialogBox :from_item="edit_form_item" :FormData="editForm" :card-btn="title"
                :dialog-visible="editdialogVisible" :title="title" @cancle="handleCancle" @submit="handleEditBtn">
                <template #price>
                    <el-input v-model.number="editForm.price" :value="editForm.price === 0 ? '' : editForm.price"
                        type="number" :min="0" :step="1" placeholder="请输入产品单价">
                        <template #append>/ 件</template>
                    </el-input>
                </template>
                <!-- 所属供应商 -->
                <template #supplier_id>
                    <el-select v-model="editForm.supplier_id" class="m-2" placeholder="请选择供应商">
                        <el-option v-for="item in supplier_options" :key="item?._id" :label="item?.name"
                            :value="item?._id" />
                    </el-select>
                </template>
            </dialogBox>
        </div>
    </div>
</template>

<script setup lang="ts" >
import { ref, reactive, onMounted, Ref } from 'vue';
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import TableCom from '../../components/TbaleCom.vue';
import dialogBox from '../../components/dialogBox.vue';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../../api/product'
import { getSupplier } from '../../api/supplier'
import ExportExcle from '../../utils/ExportExcle';

//表格数据
interface TableItem {
    _id?: string,
    name: string,
    img_url: string[],
    price: number,
    supplier_id: any
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

const columns: Column[] = [
    {
        label: '产品名',
        prop: 'name',
        // width: '120'
    }, {
        label: '产品图片',
        // prop:'logo',
        // width: "120",
        slotName: 'img_url'
    }, {
        label: '产品单价',
        prop: 'price',
        // width: "150"
    }, {
        label: '所属供应商',
        slotName: 'supplier_id'
    }, {
        label: '详情',
        slotName: "detail",
        width: "80"
    },
    {
        label: '操作',
        width: '250',
        slotName: 'operate'
    }
]
//表单搜索数据
const query = reactive({
    search: '',
    pageIndex: 1,
    pageSize: 7
})
//上传图片的路径
const uploadUrl = 'http://127.0.0.1:2580/upload';
//上传图片请求投配置
const uploadHearders = {
    authorization: `Bearer ${sessionStorage.getItem('token')}`,
    permlist: JSON.parse(sessionStorage.getItem('userInfo') || '').Perm_id.permissions
}
//编辑和新增弹窗
let editdialogVisible: Ref<boolean> = ref(false);
let addialogVisible: Ref<boolean> = ref(false);
const title = ref('')
//全部表格数据和展示表格数据
const tableData = ref<TableItem[]>([]);
const showTable = ref<TableItem[]>([])

//全部供应商
const supplier_options: any = ref([])

//新增弹窗绑定的表单数据
const addForm = ref<TableItem>({
    name: "",
    price: 0,
    img_url: [],
    supplier_id: ''
})
//编辑弹窗所绑定的表单数据
const editForm = ref<TableItem>({
    name: "",
    price: 0,
    img_url: [],
    supplier_id: ''
})
//表单每一项
const edit_form_item: FormItem[] = [
    {
        label: '产品名称',
        prop: 'name'
        // slotName: 'name',
    }, {
        label: '产品单价',
        slotName: 'price',
        prop: 'price'
    }, {
        label: '所属供应商',
        slotName: "supplier_id"
    }
]
const add_form_item: FormItem[] = [
    {
        label: '产品名称',
        prop: 'name'
        // slotName: 'name',
    }, {
        label: '产品单价',
        slotName: 'price',
        prop: 'price'
    }, {
        label: '所属供应商',
        slotName: "supplier_id"
    }, {
        label: '产品图片',
        slotName: 'img_url'
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

//上传之前
const beforeAvatarUpload = (file: any) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isJPG) {
        ElMessage({
            message: '上传文件必须为图片形式',
            type: 'error',
        });
        return false;
    }
    if (!isLt2M) {
        ElMessage({
            message: '上传头像图片大小不能超过 2MB!',
            type: "error",
        });
        return false;
    }
    return true;
}
//上传成功
const uploadSuccess = (res: any) => {
    if (title.value === '新增') {
        addForm.value.img_url.push(res.url)
    }
}

//删除管理员
const handleDelete = (_id: string) => {
    console.log(_id);

    // 二次确认删除
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            deleteProduct(_id).then(res => {
                ElMessage.success(res.msg)
                getAllProduct()
            })
        })
}

//点击新增按钮
const handleAdd = () => {
    title.value = '新增'
    addialogVisible.value = true
}
//清空选择器
const clearSelect = () => {

}

//确认新增
const handleAddBtn = () => {
    // console.log(addForm.value)
    addProduct(
        addForm.value.name,
        addForm.value.img_url,
        addForm.value.supplier_id,
        addForm.value.price
    ).then(res => {
        addForm.value = { name: "", price: 0, img_url: [], supplier_id: '' }
        addialogVisible.value = false
        ElMessage.success(res.msg)
        getAllProduct()
    }).catch(err => {
        console.log(err);
    })
}

//点击取消
const handleCancle = () => {
    if (title.value === '新增') {
        addForm.value = { name: "", price: 0, img_url: [], supplier_id: '' }
        addialogVisible.value = false
    } else if (title.value === '编辑') {
        editdialogVisible.value = false
        editForm.value = { name: "", price: 0, img_url: [], supplier_id: '' }
    }
}

//点击每一行的编辑按钮
const handleEdit = (row: any) => {
    title.value = '编辑'
    editdialogVisible.value = true
    editForm.value = { ...row }
    editForm.value.supplier_id = editForm.value.supplier_id._id
}
//确定编辑
const handleEditBtn = () => {
    console.log(editForm.value);
    updateProduct(editForm.value._id, editForm.value).then(res => {
        console.log(res);
        ElMessage.success(res.msg)
        query.pageIndex = 1
        editdialogVisible.value = false
        getAllProduct(query.search)
    }).catch(err => {
        console.log(err);
        ElMessage.error(err.msg)
    })
}
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
    addForm.value.img_url = addForm.value.img_url.slice(-3)
}
//搜索产品
const searchProduct = () => {
    getProducts(query.search).then(res => {
        query.pageIndex = 1
        console.log(res);
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize)
    }).catch(err => {
        ElMessage.error(err.msg)
    })
}
//获取所有产品
const getAllProduct = (name: string | undefined = undefined) => {
    getProducts(name).then(res => {
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize)
        console.log(res);
    })
}

const exportExcle = () => {
    ExportExcle(tableData,
     ['序号','产品编号','产品名称', '产品图片', '供应商', '价格', '介绍'], '产品表',
     ['_id','name','img_url','supplier_id','price','introduce'])
}
onMounted(() => {
    getAllProduct()
    getSupplier().then(res => {
        supplier_options.value = res.data
    })
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
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}

.perm {
    margin: 5px;
}
</style>
