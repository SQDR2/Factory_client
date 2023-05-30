<template>
    <div class="container">
        <el-steps :active="active" align-center finish-status="success">
            <el-step title="订单创建..." :description="dayjs(o_detail.createdAt).format('YYYY-MM-DD HH:mm:ss')" />
            <el-step title="订单完成..."
                :description="o_detail.iscomplete ? dayjs(o_detail.iscomplete).format('YYYY-MM-DD HH:mm:ss') : '暂未完成！'" />
            <el-step title="二次确认..." :description="o_detail.secondComplete ?
                dayjs(o_detail.secondComplete).format('YYYY-MM-DD HH:mm:ss') : '暂未完成！'" />
        </el-steps>
        <div class="o_detail_button">
            <el-button disabled>创建订单</el-button>
            <el-button @click="completeOrder" :disabled="o_detail.status">完成订单</el-button>
            <el-button @click="secondComplete" :disabled="o_detail.secondComplete ? true : false">确认完成</el-button>
        </div>
        <div class="o_detail_contain">
            <h4>订单产品：</h4>
            <div class="productItem" v-for="(item, index) in o_detail.o_product" :key="item._id">
                <el-image style="width: 85px; height: 85px" :src="item.img_url[0]" fit="fill" />
                <div class="itemIntroduce" v-html="item.introduce"></div>
                <div class="itemPrice">
                    <div>
                        <h5>数量</h5>
                        <p>{{ 'X ' + o_detail.quantity[index] }}</p>
                    </div>
                    <div>
                        <h5>价格</h5>
                        <p>{{ (Number(o_detail.quantity[index] * item.price)).toLocaleString('zh-CN', options) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="other">
            <h4>实际收款：{{ Number(o_detail.o_price).toLocaleString('zh-CN', options) }}</h4>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs'
import { getOrders, editOrder } from '../../api/order'
import { ElMessage } from 'element-plus';

const active = ref(1)
const props = defineProps({
    _id: String
})
const o_detail: any = ref({})
const options = {
    style: 'currency',
    currency: 'CNY',
};

const geto_detail = (_id: string) => {
    getOrders(_id).then(res => {
        o_detail.value = res.data[0]
        active.value = o_detail.value.iscomplete !== null ? 2 : 1
        active.value = o_detail.value.secondComplete !== null ? 3 : active.value
    })
}
if (!sessionStorage.getItem('o_id')) {
    // ExistingID.value = true
    sessionStorage.setItem('o_id', props._id || "")
}
if (sessionStorage.getItem('o_id') === "") {
    // ExistingID.value = false
    sessionStorage.removeItem('o_id')
}
let _id: string = sessionStorage.getItem("o_id") || ''
if (_id && _id !== '') {
    if (props._id === undefined) {
        geto_detail(_id)
    } else {
        sessionStorage.removeItem('o_id')
        sessionStorage.setItem('o_id', props._id || '')
        geto_detail(props._id)
    }
}

//点击按钮完成订单
const completeOrder = () => {
    if (!o_detail.value.iscomplete) {
        editOrder(o_detail.value._id, { status: true }).then(res => {
            ElMessage.success(res.msg)
            geto_detail(o_detail.value._id)
        })
    }
}
//二次确认
const secondComplete = () => {
    if (!o_detail.value.secondComplete) {
        editOrder(o_detail.value._id, { secondComplete: new Date() }).then(res => {
            ElMessage.success(res.msg)
            geto_detail(o_detail.value._id)
        })
    }
}
</script>

<style scoped>
.o_detail_button {
    margin: 20px 130px 0 140px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.o_detail_button :last-child {
    margin-right: 13px;
}

.other,
.o_detail_contain {
    margin: 20px 130px 0 140px;
}

.o_detail_contain .productItem {
    height: 85px;
    display: flex;
    flex-direction: row;
    margin: 10px 0;
}

.o_detail_contain .productItem .itemIntroduce {
    height: 85px;
    width: 600px;
    margin: 0 15px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.o_detail_contain .productItem .itemPrice {
    height: 85px;
    width: 200px;
    display: flex;
    flex-direction: row;
}

.o_detail_contain .productItem .itemPrice :first-child {
    flex: 1;
}

.o_detail_contain .productItem .itemPrice :last-child {
    flex: 2;
}

.o_detail_contain .productItem .itemPrice div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.o_detail_contain .productItem .itemPrice div :last-child {
    line-height: 30px;
}
</style>