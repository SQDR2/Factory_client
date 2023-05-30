<template>
    <el-dialog :model-value="dialogVisible" :title="title" @close="handleCancle" draggable>
        <el-form label-width="110px" :model="FormData" ref="FormRule" :rules="rules">
            <el-form-item v-for="item in from_item" :label="item.label" :prop="item.prop">
                <template v-if="item.slotName" #default="{ row }">
                    <slot :name="item.slotName" :row="row"></slot>
                </template>
                <el-input v-if="item.prop" :disabled="item.disabled" v-model="FormData[item.prop]" :placeholder="`请输入${item.label}`"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleCancle">取消</el-button>
                <el-button type="primary" @click="submit(FormRule)">
                    {{ cardBtn }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { onMounted, ref } from 'vue';

interface Form {
    name?: string,
    [key: string]: any
}
//表单form-item
interface FormItem {
    label: string,
    prop?: string,
    slotName?: string,
    disabled?: boolean
}

const rules: FormRules = {
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 2, max: 10, message: '长度应该为2-10', trigger: 'blur' },
    ],
    phone: [
        {
            required: true,
            message: '请添加手机号码',
            trigger: 'blur',
        },
        {
            pattern: /^1[3456789]\d{9}$/,
            message: '手机号码格式不正确',
            trigger: 'blur',
        }
    ],
    price: [
        {
            required: true,
            message: '请添加产品单价',
            trigger: 'blur',
        }, {
            type: 'number', message: '价格必须为数字'
        }
    ]
}
// 接收父组件传来的
defineProps<{
    //是否展示
    dialogVisible: boolean,
    //标题
    title: string,
    //确认按钮
    cardBtn: string,
    //表单数据
    FormData: Form,
    //form-item
    from_item: FormItem[]
}>();


// 子传父
const emits = defineEmits(["cancle", "submit"]);
const FormRule = ref<FormInstance>();
//关闭弹窗
const handleCancle = () => {
    emits('cancle')
}

//点击提交按钮
const submit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            emits('submit')
        } else {
            //没有通过表单验证
            ElMessage({
                message: '当前存在信息未通过验证或未输入！',
                type: 'error',
            });
        }
    })
}
</script>