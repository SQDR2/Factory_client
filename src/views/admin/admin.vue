<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.search" clearable placeholder="管理员名称/手机号码" class="handle-input mr10"
                    @change="handleSearch(query.search)" @clear="chearInput"></el-input>
                <el-button type="primary" :icon="Search" @click="handleSearch(query.search)">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
            </div>
            <TableCom :Columns="columns" :data="showTable" :headAlign="'center'" :align="'center'">
                <!-- 头像 -->
                <template #logo="scope">
                    <el-image class="table-td-thumb" :src="scope.row.logo" :z-index="100"
                        :preview-src-list="[scope.row.logo]" preview-teleported>
                    </el-image>
                </template>

                <!-- 身份 -->
                <template #identity="scope">
                    <el-tag effect="dark" :type="tag_obj[scope.row.Perm_id.Permission_role]">
                        {{ scope.row.Perm_id.Permission_role }}
                    </el-tag>
                </template>

                <!-- 展开行，展开权限列表 -->
                <template #PermList="scope">
                    <el-tag class="perm" v-if="!scope.row.Perm_id.permissions.length">暂无权限</el-tag>
                    <el-tag class="perm" v-for="item in scope.row.Perm_id.permissions">{{ item }}</el-tag>
                </template>

                <!-- 最近更新 -->
                <template #createdAt="scope">
                    {{ scope.row.createdAt === undefined ? '' : dayjs(scope.row.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
                <!-- 最近更新 -->
                <template #updatedAt="scope">
                    {{ scope.row.updatedAt === undefined ? '' : dayjs(scope.row.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
                </template>

                <!-- 操作 -->
                <template #operate="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)" >
                        编辑
                    </el-button>
                    <el-button text :icon="Delete" class="red" @click="handleDelete(scope.row._id)" >
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

            <!-- 新增管理员 -->
            <dialogBox :from_item="add_form_item" :FormData="addForm" :card-btn="title" :dialog-visible="addialogVisible"
                :title="title" @submit="handleAddBtn" @cancle="handleCancle">
                <!-- 选择图片插槽 -->
                <template #logo>
                    <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :on-exceed="handleExceed"
                        :auto-upload="false" :before-upload="beforeAvatarUpload" :headers="uploadHearders"
                        :on-success="uploadSuccess" :on-change="changeFile" :on-remove="removeFile">
                        <template #trigger>
                            <el-button type="primary">选择头像</el-button>
                        </template>
                    </el-upload>
                </template>
                <template #Perm_id>
                    <el-select v-model="addForm.Perm_id" clearable @clear="clearSelect" placeholder="请选择身份">
                        <el-option v-for="item in Perm_options" :key="item._id" :label="item.Permission_role"
                            :value="item._id" />
                    </el-select>
                </template>
            </dialogBox>

            <dialogBox :from_item="edit_form_item" :FormData="editForm" :card-btn="title" :dialog-visible="editdialogVisible"
                :title="title" @cancle="handleCancle" @submit="handleAddBtn">
                <!-- 选择图片插槽 -->
                <template #logo>
                    <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :on-exceed="handleExceed"
                        :auto-upload="false" :before-upload="beforeAvatarUpload" :headers="uploadHearders"
                        :on-success="uploadSuccess" :on-change="changeFile" :on-remove="removeFile">
                        <template #trigger>
                            <el-button type="primary">选择头像</el-button>
                        </template>
                    </el-upload>
                </template>
                <template #Perm_id>
                    <el-select v-model="editForm.Perm_id" clearable @clear="clearSelect" placeholder="请选择身份">
                        <el-option v-for="role in Perm_options" :key="role._id" :label="role.Permission_role"
                            :value="role._id" />
                    </el-select>
                </template>
            </dialogBox>
        </div>
    </div>
</template>

<script setup lang="ts" >
import { ref, reactive, onMounted, Ref } from 'vue';
import { ElMessage, ElMessageBox, genFileId, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import TableCom from '../../components/TbaleCom.vue';
import dialogBox from '../../components/dialogBox.vue';
import { getAdmin, deleteAdmin, addAdmin, updateAdmin } from '../../api/admin';
import { getPerm } from '../../api/permission';


//表格数据
interface TableItem {
    _id?: string,
    name: string,
    logo: string,
    phone: string,
    Perm_id: any,
    createAt?: string,
    updateAt?: string,
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
    disabled?:boolean
}
//身份选项的类型
interface Perm_Type {
    _id: string,
    permissions: string[],
    Permission_role: string
}
//身份tag颜色
const tag_obj: { [key: string]: string } = {
    "董事": '',
    "经理": "success",
    "部长": 'warning',
    "主管": "info"
}
const columns: Column[] = [
    {
        label: '姓名',
        prop: 'name',
        width: '120'
    }, {
        label: '头像',
        // prop:'logo',
        // width: "120",
        slotName: 'logo'
    }, {
        label: '电话号码',
        prop: 'phone',
        // width: "150"
    },
    {
        label: '身份',
        // prop:'identity',
        width: "130",
        slotName: 'identity'
    }, {
        label: "权限",
        width: "70",
        slotName: 'PermList',
        type: 'expand'
    }, {
        label: "创建时间",
        width: "160",
        slotName: 'createdAt'
    },
    {
        label: '最近更新',
        width: '160',
        slotName: 'updatedAt'
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
//编辑和新增弹窗
let editdialogVisible: Ref<boolean> = ref(false);
let addialogVisible: Ref<boolean> = ref(false);
const title = ref('')
//全部表格数据和展示表格数据
const tableData = ref<TableItem[]>([]);
const showTable = ref<TableItem[]>([])


//新增弹窗绑定的表单数据
const addForm = ref<TableItem>({
    name: "",
    phone: "",
    logo: "",
    Perm_id: ""
})
//编辑弹窗所绑定的表单数据
const editForm = ref<TableItem>({
    name: "",
    phone: "",
    logo: "",
    Perm_id: ""
})
//表单每一项
const edit_form_item: FormItem[] = [
    {
        label: '头像',
        slotName: 'logo'
    },
    {
        label: '姓名',
        prop: 'name',
        disabled:true
        // slotName: 'name',
    }, {
        label: '手机号码',
        // slotName: 'phone'
        prop: 'phone'
    }, {
        label: '角色',
        slotName: "Perm_id"
    }
]
const add_form_item: FormItem[] = [
    {
        label: '头像',
        slotName: 'logo'
    },
    {
        label: '姓名',
        prop: 'name'
        // slotName: 'name',
    }, {
        label: '手机号码',
        // slotName: 'phone'
        prop: 'phone'
    }, {
        label: '角色',
        slotName: "Perm_id"
    }
]
//身份选项
const Perm_options = reactive<Perm_Type[]>([])
//获取全部管理员信息和权限
const getAdminAndPerm = (aInfo?: any) => {
    getAdmin(aInfo).then(res => {
        tableData.value = res.data
        showTable.value = tableData.value.slice(0, query.pageSize);
    })
        .catch(err => {
            ElMessage.error(err.msg)
        })
}

//存在上传文件
let ExistenceFile = '';
//上传图片路径
const uploadUrl = 'http://127.0.0.1:2580/upload';
//上传图片请求投配置
const uploadHearders = {
    authorization: `Bearer ${sessionStorage.getItem('token')}`,
    permlist: JSON.parse(sessionStorage.getItem('userInfo') || '').Perm_id.permissions
}
//上传图片组件实例
const upload = ref<UploadInstance>()
//当上传超出限制时，执行的钩子函数
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}
//上传之前
const beforeAvatarUpload = (file: any) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
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
//移除图片
const removeFile = () => {
    ExistenceFile = ''
}
//图片发生改变
const changeFile = (file: any) => {
    ExistenceFile = file;
}
//上传图片成功钩子函数
const uploadSuccess = (res: any) => {
    console.log(res)
    if (res.code === 200) {
        if (title.value === '新增') {
            addForm.value.logo = res.url
            addAdmin(addForm.value).then(res => {
                ElMessage.success(res.msg);
                addialogVisible.value = false;
                getAdminAndPerm()
                upload.value!.clearFiles()

                addForm.value.name = ''
                addForm.value.phone = ''
                addForm.value.logo = ''
                addForm.value.Perm_id = ''

            }).catch(err => {
                ElMessage.error(err.msg)
            })
        } else if (title.value === '编辑') {
            editForm.value.logo = res.url
            console.log(editForm.value)
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '')
            updateAdmin(userInfo, editForm.value._id, editForm.value).then(res => {
                getAdminAndPerm()
                ElMessage.success(res.msg)
                editdialogVisible.value = false
            }).catch(err => {
                ElMessage.error(err.msg)
            })
        }
    } else {
        ElMessage.error('上传失败！请检查网络或重新上传！')
    }
}

// 点击其他页
const handlePageChange = (val: number) => {
    showTable.value = tableData.value.slice((query.pageSize * (val - 1)), (query.pageSize * (val)))
}
//分页数量改变
const handleSizeChange = (val: number) => {
    showTable.value = tableData.value.slice(0, val)
}

// 查询操作
const handleSearch = (val: string) => {
    let value = Number(val)
    if (isNaN(value)) {        //名字
        getAdminAndPerm(`name=${val}`)
    } else if (typeof value === 'number' && value !== 0) {    //手机号码
        getAdminAndPerm(`phone=${val}`)
    } else if (value === 0) {                          //输入框为空值是点击
        getAdminAndPerm()
    }
}
//清空搜索input框
const chearInput = () => { getAdminAndPerm() }

//删除管理员
const handleDelete = (_id: string) => {
    console.log(_id);

    // 二次确认删除
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            deleteAdmin({ _id }).then(res => {
                getAdminAndPerm()
                ElMessage.success(res.msg)
            }).catch(err => {
                ElMessage.error(err.msg)
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
    addForm.value.Perm_id = ''
}
//确认新增
const handleAddBtn = () => {
    if (ExistenceFile) {
        //点击确定新增/编辑按钮，只确定上传图片，上传 成功后在上传成功函数中执行添加管理员
        upload.value?.submit()
    } else {
        let userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '')
        updateAdmin(userInfo, editForm.value._id, editForm.value).then(res => {
            getAdminAndPerm()
            ElMessage.success(res.msg)
            editdialogVisible.value = false
        }).catch(err => {
            ElMessage.error(err.msg)
        })
    }
}
//点击取消
const handleCancle = () => {
    if (title.value === '新增') {
        addialogVisible.value = false
        addForm.value.name = ''
        addForm.value.phone = ''
        addForm.value.logo = ''
        addForm.value.Perm_id = ''
    } else if (title.value === '编辑') {
        editdialogVisible.value = false
    }
}

//点击没一行的编辑按钮
const handleEdit = (row: any) => {
    title.value = '编辑'
    editdialogVisible.value = true
    editForm.value = { ...row }
    editForm.value.Perm_id = row.Perm_id._id
}

onMounted(() => {
    getAdminAndPerm()
    getPerm().then(res => {
        Perm_options.push(...(res.data))
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
