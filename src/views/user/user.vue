<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="clearfix">
                            <span>基础信息</span>
                        </div>
                    </template>
                    <div class="info">
                        <div class="info-image" @click="showDialog">
                            <el-avatar :size="100" :src="avatarImg" />
                            <span class="info-edit">
                                <i class="el-icon-lx-camerafill"></i>
                            </span>
                        </div>
                        <div class="info-name">{{ userInfo.name }}</div>
                        <div class="info-role">{{ userInfo.Perm_id.Permission_role }}</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <template #header>
                        <div class="clearfix">
                            <span>账户编辑</span>
                        </div>
                    </template>
                    <el-form label-width="90px">
                        <el-form-item label="姓名："> {{ userInfo.name }} </el-form-item>
                        <el-form-item label="旧密码：">
                            <el-input type="password" show-password v-model="form.oldPW"></el-input>
                        </el-form-item>
                        <el-form-item label="新密码：">
                            <el-input type="password" show-password v-model="form.newPW"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit">修改密码</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="更换头像" v-model="dialogVisible" width="600px" @close="close">
            <el-image style="width: 300px; height: 300px;margin-left: 125px;" :src="bigImg" fit="contain" />
            <template #footer>
                <el-upload ref="upload" class="upload-demo" :action="uploadUrl" :limit="1" :auto-upload="false"
                    :on-exceed="onExceed" @before-upload="beforeAvatarUpload" :headers="uploadHearders"
                    :show-file-list="false" :on-change="changeFile" :on-success="onSuccess">
                    <template #trigger>
                        <el-button type="primary">选择头像</el-button>
                    </template>
                    <el-button class="ml-3" type="success" @click="saveLogo">
                        保存并上传
                    </el-button>
                </el-upload>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="user">
import { reactive, ref } from 'vue';
import { ElMessage, genFileId, UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { useRouter } from 'vue-router';
import { updatelogo } from '../../api/admin'
import { changePW } from '../../api/admin'

const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '');
const form = reactive({
    oldPW: '',
    newPW: '',
});
const router = useRouter();
const onSubmit = () => {
    let _id = userInfo._id
    changePW(_id, form.oldPW, form.newPW).then(res => {
        //修改成功，退出登录。跳转到登录界面
        sessionStorage.removeItem('token');
        sessionStorage.removeItem("userInfo");
        router.push('/login');
        ElMessage.success(res.msg)
    }).catch(err => {
        ElMessage.error(err.msg)
    })
};

const avatarImg = ref(userInfo.logo);
const bigImg = ref(userInfo.logo)
const dialogVisible = ref(false);
const uploadUrl = 'http://127.0.0.1:2580/upload';
//上传图片组件实例
const upload = ref<UploadInstance>()
let isChoose: boolean = false
const uploadHearders = {
    authorization: `Bearer ${sessionStorage.getItem('token')}`,
    permlist: JSON.parse(sessionStorage.getItem('userInfo') || '').Perm_id.permissions
}

const showDialog = () => {
    dialogVisible.value = true;
};

const close = () => {
    isChoose = false
    bigImg.value = JSON.parse(sessionStorage.getItem('userInfo') || '').logo;
}

const saveLogo = () => {
    if (isChoose) {
        upload.value?.submit()
    }
};
const onSuccess = (res: any) => {
    updatelogo(userInfo._id, res.url).then(update_res => {
        let userInfo = JSON.parse(sessionStorage.getItem('userInfo')||'');
        userInfo.logo = res.url;
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        dialogVisible.value = false
        ElMessage.success(update_res.msg)
        location.reload();
    }).catch(err=>{
        ElMessage.error(err.msg)
    })
}
const changeFile = (file: any) => {
    isChoose = true
    bigImg.value = URL.createObjectURL(file.raw);
}
//超出限制
const onExceed: UploadProps['onExceed'] = (files) => {
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
</script>

<style scoped>
.info {
    text-align: center;
    padding: 35px 0;
}

.info-image {
    position: relative;
    margin: auto;
    width: 100px;
    height: 100px;
    background: #f8f8f8;
    border: 1px solid #eee;
    border-radius: 50px;
    overflow: hidden;
}

.info-edit {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.info-edit i {
    color: #eee;
    font-size: 25px;
}

.info-image:hover .info-edit {
    opacity: 1;
}

.info-name {
    margin: 15px 0 10px;
    font-size: 24px;
    font-weight: 500;
    color: #262626;
}


.upload-demo .ml-3 {
    margin: 0 5px;
}
</style>
