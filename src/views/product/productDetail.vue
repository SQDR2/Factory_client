<template>
    <div class="container">
        <div v-if="ExistingID">
            <h2>产品详情</h2>
            <el-divider />
            <p><b>产品名称：</b>{{ detail.name }}</p>
            <p><b>产品价格：</b>{{ detail.price }}元 / 件</p>
            <!-- <el-divider /> -->
            <p><b>所属供应商：</b>{{ detail.supplier_id.name }}</p>
            <el-divider />
            <div class="introduce_deit">
                <h4>产品描述：</h4>
                <el-button type="primary" @click="showEdit">编辑</el-button>
            </div>
            <div v-if="!showEditor">
                <p v-html="detail?.introduce"></p>
            </div>
            <div v-show="showEditor">
                <div class="mgb20" ref="editor"></div>
                <el-button type="primary" @click="cancle">取消</el-button>
                <el-button type="primary" @click="syncHTML">提交</el-button>
            </div>
            <el-divider />
            <h4>产品展示：</h4>
            <div>
                <el-tooltip class="box-item" effect="dark" content="点击图片展示大图" placement="left">
                    <el-carousel indicator-position="outside">
                        <el-carousel-item v-for="(image, index) in detail.img_url" :key="index">
                            <el-image style="width: 600px;height:300px;" :src="image" @click="preview(image)" fit="cover" />
                        </el-carousel-item>
                    </el-carousel>
                </el-tooltip>
            </div>
            <el-dialog v-model="previewVisible" width="30%">
                <el-image :src="previewUrl"></el-image>
            </el-dialog>
        </div>
        <div v-else>
            <el-alert title="请前往《产品管理》选择查看详情的产品" type="error" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, onBeforeUnmount } from 'vue';
import { updateProduct, getProducts } from '../../api/product';
import WangEditor from 'wangeditor';
import { ElMessage } from 'element-plus';

//获取编辑器实例
const editor = ref(null);
const content = reactive({
    html: '',
    text: ''
});
let instance: any;
//展示富文本编辑器
const showEditor = ref(false)

const previewVisible = ref(false)
const previewUrl = ref('')
const props = defineProps({
    _id: String
})

//该产品详情
const detail: any = ref({
    name: "",
    supplier_id: { name: '' }

})

//sessionStroage中存在_id
const ExistingID = ref(true)
if (!sessionStorage.getItem('p_id')) {
    ExistingID.value = true
    sessionStorage.setItem('p_id', props._id || "")
}
if (sessionStorage.getItem('p_id') === "") {
    ExistingID.value = false
    sessionStorage.removeItem('p_id')
}
let _id = sessionStorage.getItem("p_id")
if (_id && _id !== '') {
    if (props._id === undefined) {
        getProducts(_id).then(res => {
            detail.value = res.data[0]
            console.log(1, detail.value);
        })
    } else {
        sessionStorage.removeItem('p_id')
        sessionStorage.setItem('p_id', props._id || '')
        getProducts(props._id).then(res => {
            detail.value = res.data[0]
            console.log(2, detail.value)
        })
    }
}


//点击图片进行预览
const preview = (url: string) => {
    previewUrl.value = url
    previewVisible.value = true
}

//点击编辑按钮展示富文本编辑器
const showEdit = () => {
    showEditor.value = true
    if (!instance) {
        instance = new WangEditor(editor.value);
        instance.config.zIndex = 1;
        instance.create();
        instance.txt.html(`<p>${detail.value.introduce}</p>`)
    }
}

//点击修改保存按钮
const syncHTML = () => {
    content.html = instance.txt.html();
    updateProduct(sessionStorage.getItem('p_id') || '', { introduce: content.html })
        .then(res => {
            showEditor.value = false
            ElMessage.success(res.msg)
            detail.value.introduce = content.html
        })
};
const cancle = () => {
    showEditor.value = false
}


onBeforeUnmount(() => {
    if (instance) {
        instance.destroy();
        instance = null;
    }
});
</script>

<style scoped>
.el-carousel {
    width: 50%;
    margin: 0 auto;
}

.introduce_deit {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
</style>