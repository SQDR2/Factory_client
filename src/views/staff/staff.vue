<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.search" clearable placeholder="员工名称/手机号码" class="handle-input mr10"
                    @change="handleSearch(query.search)" @clear="chearInput"></el-input>
                <el-button type="primary" :icon="Search" @click="handleSearch(query.search)">搜索</el-button>
                <el-button type="primary" :icon="Plus" @click="addbtn">新增员工</el-button>
                <el-button type="primary" @click="exportExcle">导出Excel</el-button>
            </div>

            <TableCom :Columns="columns" :data="showTable" :head-align="'false'" :align="'false'">
                <!-- 头像 -->
                <template #staff_logo="scope">
                    <el-image class="table-td-thumb" :src="scope.row.staff_logo" :z-index="100"
                        :preview-src-list="[scope.row.staff_logo]" preview-teleported>
                    </el-image>
                </template>
                <!-- 是否在职 -->
                <template #onjob="scope">
                    <el-tag :type="
                        scope.row.onjob === true ? 'success' : scope.row.onjob === false ? 'danger' : ''">
                        {{ scope.row.onjob ? '在职' : '离职' }}
                    </el-tag>
                </template>
                <template #referrer='scope'>
                    {{ scope.row.referrer ? scope.row.referrer.name : '' }}
                </template>
                <!-- 离职时间 -->
                <!-- <template #quittime="scope">
                    {{ scope.row.quittime === null ? '' : dayjs(scope.row.quittime).format('YYYY-MM-DD HH:mm:ss') }}
                </template> -->
                <template #detail="scope">
                    <router-link :to="{ name: 'SDetail', params: { _id: scope.row._id } }">详情</router-link>
                </template>
                <!-- 操作 -->
                <template #operate="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)" v-permiss="15">
                        编辑
                    </el-button>
                    <el-button text :icon="Delete" class="red" @click="handleDelete(scope.row)" v-permiss="16">
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
        </div>
        <dialogBox :from_item="form_item" :FormData="addForm" :card-btn="title" :dialog-visible="addialogVisible"
            :title="title" @submit="Definite" @cancle="DialogClose">
            <template #staff_logo>
                <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :on-exceed="handleExceed"
                    :auto-upload="false" :before-upload="beforeAvatarUpload" :headers="uploadHearders"
                    :on-success="uploadSuccess">
                    <template #trigger>
                        <el-button type="primary">选择头像</el-button>
                    </template>
                </el-upload>
            </template>
            <template #referrer>
                <el-select v-model="addForm.referrer" collapse-tags placeholder="请选择入职推荐人" style="width: 240px">
                    <el-option v-for="item in referrers" :key="item._id" :label="item.name" :value="item._id" />
                </el-select>
            </template>
            <template #age>
                <el-input-number v-model="addForm.age" :min="16" :max="60" />
            </template>
            <template #sex>
                <el-radio-group v-model="addForm.sex">
                    <el-radio label="男" border>男</el-radio>
                    <el-radio label="女" border>女</el-radio>
                </el-radio-group>
            </template>
            <template #onjob>
                <el-radio-group v-model="addForm.onjob">
                    <el-radio :label="true" border>在职</el-radio>
                    <el-radio :label="false" border>离职</el-radio>
                </el-radio-group>
            </template>
        </dialogBox>

        <dialogBox :from_item="editform_item" :FormData="editForm" :card-btn="title" :dialog-visible="editdialogVisible"
            :title="title" @submit="Definite" @cancle="DialogClose">
            <template #staff_logo>
                <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :on-exceed="handleExceed"
                    :auto-upload="false" :before-upload="beforeAvatarUpload" :headers="uploadHearders"
                    :on-success="uploadSuccess" :on-change="onChange">
                    <template #trigger>
                        <el-button type="primary">选择头像</el-button>
                    </template>
                </el-upload>
            </template>
            <template #age>
                <el-input-number v-model="editForm.age" :min="16" :max="60" />
            </template>
            <template #onjob>
                <el-radio-group v-model="editForm.onjob">
                    <el-radio :label="true" border>在职</el-radio>
                    <el-radio :label="false" border>离职</el-radio>
                </el-radio-group>
            </template>
        </dialogBox>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, Ref } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, genFileId, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue'
import { getStaff, editStaff, deleteStaff, addStaff } from '../../api/staff'
import dayjs from 'dayjs'
import TableCom from '../../components/TbaleCom.vue'
import ExportExcle from '../../utils/ExportExcle'
import dialogBox from '../../components/dialogBox.vue'
import { getAdmin } from '../../api/admin'
interface TableItem {
    _id?: String,
    name: string,
    sex: string,
    age: number,
    staff_logo: string,
    phone: string,
    referrer: any,
    onjob: boolean,
    createAt?: string,
    quittime?: string
}
//表格列
interface Column {
    label: string,
    prop?: string,
    width: string,
    slotName?: string
}
//表格列
const columns: Column[] = [
    {
        label: '员工名称',
        prop: 'name',
        width: '100'
    },
    {
        label: '性别',
        prop: 'sex',
        width: '60'
    },
    {
        label: '年龄',
        prop: 'age',
        width: '60'
    },
    {
        label: '头像(查看大图)',
        // prop: 'staff_logo',
        width: '120',
        slotName: 'staff_logo'
    },
    {
        label: '手机号码',
        prop: 'phone',
        width: '120'
    }, {
        label: '入职推荐人',
        // prop: 'referrer',
        slotName: "referrer",
        width: '120'
    }, {
        label: '状态',
        // prop: 'onjob',
        slotName: 'onjob',
        width: '80'
    },
    {
        label: '入职时间',
        prop: 'createdAt',
        width: ''
    },
    // {
    //     label: '离职时间',
    //     // prop: 'quittime',
    //     width: '',
    //     slotName: 'quittime'
    // },
    {
        label: '详情',
        // prop: 'quittime',
        width: '80',
        slotName: 'detail'
    },
    {
        label: '操作',
        width: '200',
        slotName: 'operate'
    }
]

//表单每一项类型
interface FormItem {
    label: string,
    prop?: string,
    slotName?: string,
}
const form_item: FormItem[] = [
    {
        label: '头像',
        // prop: 'staff_logo'
        slotName: 'staff_logo'
    },
    {
        label: '员工名称',
        prop: 'name'
    }, {
        label: '手机号码',
        prop: 'phone'
    }, {
        label: '入职推荐人',
        slotName: "referrer"
    }, {
        label: '年龄',
        slotName: 'age',
    }, {
        label: '性别',
        slotName: 'sex'
    }, {
        label: '状态',
        slotName: 'onjob'
    }
]
const editform_item: FormItem[] = [
    {
        label: '头像',
        // prop: 'staff_logo'
        slotName: 'staff_logo'
    },
    {
        label: '员工名称',
        prop: 'name'
    }, {
        label: '手机号码',
        prop: 'phone'
    }, {
        label: '年龄',
        slotName: 'age',
    }, {
        label: '状态',
        slotName: 'onjob'
    }
]
const addForm = ref<TableItem>({
    name: "",
    sex: "男",
    age: 16,
    staff_logo: '',
    phone: '',
    referrer: '',
    onjob: true,
})
const editForm = ref<TableItem>({
    name: "",
    sex: "男",
    age: 16,
    staff_logo: '',
    phone: '',
    referrer: '',
    onjob: true,
})
//所以管理员
const referrers: any = ref([])
//表单搜索数据
const query = reactive({
    search: '',
    pageIndex: 1,
    pageSize: 7
})
//弹窗
let editdialogVisible: Ref<boolean> = ref(false);
let addialogVisible: Ref<boolean> = ref(false);
//弹窗标题
let title: Ref<string> = ref('');
//新增员工数据
// const addInfo = ref<TableItem>({
//     _id: '',
//     name: '',
//     sex: '男',
//     staff_logo: '',
//     age: 0,
//     phone: '',
//     referrer: '',
//     onjob: true,
//     createAt: '',
//     quittime: ''
// })
//存在上传文件
let ExistenceFile = '';
const FormRule = ref<FormInstance>();
//上传图片路径
const uploadUrl = 'http://127.0.0.1:2580/upload';
//上传图片请求投配置
const uploadHearders = {
    authorization: `Bearer ${sessionStorage.getItem('token')}`,
    permlist: JSON.parse(sessionStorage.getItem('userInfo') || '').Perm_id.permissions
}
//上传图片
const upload = ref<UploadInstance>()
//是否存在上传图片
const ExistentialUpload = ref(false)
//全部员工
const tableData = ref<TableItem[]>([])
const showTable = ref<TableItem[]>([])

//生命周期函数
onMounted(() => {
    getStaffs()
    getAdmin().then(res => {
        referrers.value = res.data
    })
})

//获取所有员工的数据
const getStaffs = (info?: any) => {
    getStaff(info).then((res) => {
        console.log(res)
        tableData.value = res.data;
        showTable.value = tableData.value.slice(0, query.pageSize);
        query.pageIndex = 1
    })
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
        getStaffs(`name=${val}`)
    } else if (typeof value === 'number' && value !== 0) {    //手机号码
        getStaffs(`phone=${val}`)
    } else if (value === 0) {                          //输入框为空值是点击
        getStaffs()
    }
}
//清空搜索input框
const chearInput = () => { getStaffs() }

//当上传超出限制时，执行的钩子函数
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}
const onChange = () => {
    ExistentialUpload.value = true
}
//上传图片成功钩子函数
const uploadSuccess = (res: any) => {
    if (title.value === '编辑') {
        //将被编辑者的头像url换成新上传的头像字符串
        updateStaff(res)
    } else if (title.value === '新增') {
        console.log(addForm.value)
        //添加信息
        addForm.value.staff_logo = res.url
        addStaff(addForm.value).then(res => {
            ElMessage({
                type: res.code === 200 ? 'success' : 'error',
                message: res.msg
            })
            ExistentialUpload.value = false
            addialogVisible.value = false
            getStaffs()
        }).catch(err => {
            console.log(err);
        })
    }

}
//点击编辑按钮 
const handleEdit = (row: any) => {
    editdialogVisible.value = true
    title.value = '编辑'
    editForm.value = { ...row }
}

//更新员工数据
const updateStaff = (jpgRes?: any) => {
    if (jpgRes) {
        editForm.value!.staff_logo = jpgRes.url;
    }
    let editData = []
    editData.push({ _id: editForm.value!._id })
    editData.push(editForm.value)
    editStaff(editData).then(res => {
        if (res.code == 200) {
            //关闭窗口
            ExistentialUpload.value = false
            editdialogVisible.value = false
            getStaffs()
            ElMessage({
                message: res.msg,
                type: 'success'
            })
        } else {
            ElMessage({
                message: res.msg,
                type: res.code == 412 ? 'error' : 'warning'
            })
        }
    }).catch(err => {
        console.log(err);
    })
}

// 删除操作
const handleDelete = (_id: string) => {
    // 二次确认删除
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            deleteStaff([_id]).then(res => {
                ElMessage.success(res.msg)
                getStaffs()
            }).catch(err => {
                ElMessage.error(err.msg)
            })
        })
        .catch(() => { })
}

//点击新增员工按钮
const addbtn = () => {
    addialogVisible.value = true
    title.value = '新增'
}
//点击对话框的提交按钮
const Definite = () => {
    if (title.value === '新增') {
        if(ExistentialUpload.value){
            upload.value!.submit()
        }else{
            console.log(addForm.value)
        //添加信息
        console.log(addForm.value);
        addStaff(addForm.value).then(res => {
            ElMessage({
                type: res.code === 200 ? 'success' : 'error',
                message: res.msg
            })
            ExistentialUpload.value = false
            addialogVisible.value = false
            getStaffs()
        }).catch(err => {
            console.log(err);
        })
        }
    } else if (title.value === '编辑') {
        if(ExistentialUpload.value){
            upload.value!.submit()
        }else{
           updateStaff(); 
        }
    }
}
const submitAdd = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            //只上传图片，保存其他被编辑的信息在成功上传函数中执行
            if (ExistenceFile) {
                upload.value!.submit()
            } else {
                updateStaff();
            }
        } else {
            //没有通过表单验证
            ElMessage({
                message: '当前编辑信息存在失误',
                type: 'error',
            });
        }
    })
}
//新增员工对话框关闭
const DialogClose = () => {
    if (title.value === '新增') {
        addForm.value = { name: "", sex: "男", age: 16, staff_logo: '', phone: '', referrer: '', onjob: true, }
        addialogVisible.value = false
    } else if (title.value === '编辑') {
        upload.value!.clearFiles()
        editdialogVisible.value = false
    }
}
//导出为Excle
const exportExcle = () => {
    ExportExcle(tableData,
        ['序号', '员工编号', '员工姓名', '年龄', '性别', '联系方式', '入职推荐人', '是否在职', '入职时间', '离职时间'], '员工表',
        ['_id', 'name', 'age', 'sex', 'phone', 'referrer', 'onjob', 'createdAt', 'quittime'])
}
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

.el-upload .el-button {
    margin: 0 10px;
}
</style>
