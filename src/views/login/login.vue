<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <el-form :model="param" :rules="rules" ref="loginFormRule" label-width="0px" class="ms-content">
                <el-form-item prop="phone">
                    <el-input v-model="param.phone" placeholder="手机号码">
                        <template #prepend>
                            <el-button :icon="User"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="param.password"
                        @keyup.enter="loginBtn(loginFormRule)">
                        <template #prepend>
                            <el-button :icon="Lock"></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="loginBtn(loginFormRule)">登录</el-button>
                </div>
                <p class="login-tips">Tips :工厂管理系统</p>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTagsStore } from '../../store/tags';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Lock, User } from '@element-plus/icons-vue';
import { login } from '../../api/login'
import getAsyncRouter from '../../router/getAsyncRouter'
interface LoginInfo {
    phone: string;
    password: string;
}

const router = useRouter();
const param = reactive<LoginInfo>({
    phone: '18974095542',
    password: '123456'
});

const rules = ref({
    username: [
        {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
        }
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})


const loginFormRule = ref<FormInstance>();
// 登录按钮
const loginBtn = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            // 通过表单验证 开始请求登录
            await login(param).then(async (res: any) => {
                // 将token进行保存
                sessionStorage.setItem("token", res.token);
                //将登录用户的权限等信息进行保存
                console.log(res)
                sessionStorage.setItem("userInfo", JSON.stringify(res.data))
                //跳转页面
                router.push("/");
                loginMessage(res.code, res.msg);
            })
                .catch((error: any) => {
                    console.log(error)
                    loginMessage(error.code, error.msg)
                });
        } else {
            //没有通过表单验证
            // console.log("error submit!", fields);
            loginMessage(0, "用户名/手机号码/密码错误");
        }
    });
};
//登录成功的消息提示
const loginMessage = (code: number, msg: string) => {
    ElMessage({
        message: msg,
        type: code === 200 ? "success" : "error",
    });
};
const tags = useTagsStore();
tags.clearTags();
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../../assets/img/login-bg.jpg);
    background-size: 100%;
}

.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}

.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}

.ms-content {
    padding: 30px 30px;
}

.login-btn {
    text-align: center;
}

.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}

.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
}
</style>
