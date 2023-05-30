<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card shadow="hover" class="mgb20" style="height: 252px">
                    <div class="user-info">
                        <el-avatar :size="120" :src="imgurl" />
                        <div class="user-info-cont">
                            <div class="user-info-name">{{ name }}</div>
                            <div>{{ role }}</div>
                        </div>
                    </div>
                    <div class="user-info-list">
                        上次登录时间：
                        <span>{{ dayjs(userInfo.LoginRecord.lastLoginTime).format('YYYY-MM-DD') }}</span>
                    </div>
                    <div class="user-info-list">
                        上次登录地点：
                        <span>{{ userInfo.LoginRecord.lastLoginLocation }}</span>
                    </div>
                </el-card>
                <el-card shadow="hover" style="height: 252px" :body-style="{ 'max-height': '170px', 'overflow-y': 'auto' }">
                    <template #header>
                        <div class="clearfix">
                            <span>员工打卡记录</span>
                            <!-- <span style="float: right; padding: 3px 0">日期：{{ today }}</span> -->
                            <el-date-picker style="float: right;" v-model="today" type="date" :editable="false" size="small"
                                :disabled-date="disabledDate" @change="dateChange(today)" :clearable="false" />
                        </div>
                    </template>
                    <div class="staffRecord">
                        <div class="staffItem" v-for="item in staffSignInList" :key="item._id">
                            <div class="staffItem_name">
                                <span>{{ item.name }}</span>
                            </div>
                            <el-icon color="green" v-if="item.signInTime">
                                <SuccessFilled />
                            </el-icon>
                            <el-icon v-else color="red">
                                <CircleCloseFilled />
                            </el-icon>
                        </div>

                    </div>

                </el-card>
            </el-col>
            <el-col :span="16">
                <el-row :gutter="20" class="mgb20">
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-1">
                                <!-- <el-icon class="grid-con-icon"><User /></el-icon> -->
                                <i class="grid-con-icon iconfont icon-staff"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ staffNum }}</div>
                                    <div>员工数量</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-2">
                                <!-- <el-icon class="grid-con-icon"><ChatDotRound /></el-icon> -->
                                <i class="grid-con-icon iconfont icon-products"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ productNum }}</div>
                                    <div>产品数量</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-3">
                                <!-- <el-icon class="grid-con-icon"><Goods /></el-icon> -->
                                <i class="grid-con-icon iconfont icon-orders"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ orderNum }}</div>
                                    <div>订单数量</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-card shadow="hover" style="height: 403px" :body-style="{ 'max-height': '300px', 'overflow-y': 'auto' }">
                    <template #header>
                        <div class="clearfix">
                            <span>代办事项</span>
                        </div>
                    </template>
                    <el-table :data="leaveDate" style="width: 100%">
                        <el-table-column prop="name" label="员工名称" width="80" />
                        <el-table-column label="起止日期" width="180">
                            <template #default="{ row }">
                                {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="dayNum" label="天数" width="80" />
                        <el-table-column prop="reason" label="请假原因" />
                        <el-table-column label="是否通过">
                            <template #default="{ row }">
                                <el-tag class="ml-2"
                                    :type="row.success === null ? 'info' : row.success ? 'success' : 'danger'">{{
                                        row.success
                                        === null ? '未处理' : row.success ? '通过' : '未通过' }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="处理">
                            <template #default="{ row }">
                                <el-button type="primary" :icon="Edit"
                                    @click="diaposeLeave(row.name, row.S_id, row.dayNum, row.l_id, row)" />
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover">
                    <!-- <schart class="schart" canvasId="line" :options="options"></schart> -->
                    <schart v-if="isPieData" class="wrapper" canvasId="canvas" :options="options" />
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <schart class="wrapper" canvasId="canvas" :options="options1" />
                </el-card>
            </el-col>
        </el-row>

    </div>
</template>

<script setup lang="ts" name="dashboard">
import Schart from 'vue-schart';
import { onMounted, reactive, Ref, ref } from 'vue';
import { getOrders } from '../api/order'
import { getProducts } from '../api/product'
import { getStaff } from '../api/staff'
import dayjs from 'dayjs'
import { updateAdmin } from '../api/admin'
import { Edit } from '@element-plus/icons-vue'
import { Action, ElMessage, ElMessageBox } from 'element-plus';
import { editStaff } from '../api/staff'

let userInfo = JSON.parse(sessionStorage.getItem("userInfo") || '')
const imgurl: string | null = userInfo.logo;
const name = userInfo.name
const role: string = userInfo.Perm_id.Permission_role
const isPieData: Ref<boolean> = ref(false)
let options: any = reactive({
    type: 'pie',
    title: {
        text: '订单产品数量饼状图'
    },
    legend: {
        position: 'left'
    },
    bgColor: '#fbfbfb',
    labels: [],
    datasets: [{
        data: []
    }]
});
const options1 = {
    type: "line",
    title: {
        text: "月度订单图"
    },
    bgColor: "#fbfbfb",
    labels: ["一月", "二月", "三月", "四月", "五月"],
    datasets: [{
        label: '全部产品',
        data: [534, 378, 470, 290, 530]
    }, ]
}
const leaveDate: any = ref([])
const staffNum = ref(0)
const productNum = ref(0)
const orderNum = ref(0)
const staffs: any = ref([])
const today = ref(dayjs().format('YYYY-MM-DD'))
const staffSignInList: any = ref([])
getStaff().then(res => {
    res.data.forEach((item: any) => {
        item.onjob ? staffNum.value++ : ''
        item.onjob ? staffs.value.push(item) : ''
    })
    staffs.value.forEach((item: any) => {
        let leaveItem = []
        if (item.leaves.length !== 0) {
            leaveItem = item.leaves.map((i: any) => {
                return {
                    S_id: item._id, name: item.name,
                    startTime: i.startTime, dayNum: i.leaveNum, reason: i.reason, success: i.success, l_id: i._id
                }
            })
            leaveDate.value.push(...leaveItem)
        }
    })
    getSigninList(staffs.value, today.value)

})
getProducts().then(res => {
    options.labels = res.data.map((item: any) => item.name)
    productNum.value = res.data.length
})
getOrders().then(res => {
    console.log(res);
    let PieDataItem = res.data.map((item: any) => {
        return item.o_product.map((i: any, index: number) => {
            return { name: i.name, quantity: item.quantity[index] }
        })
    })
    options.datasets[0].data = PieDataItem.reduce((acc: any, subArr: any) => {
        subArr.forEach((item: any) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
        });
        return acc;
    }, {});

    const result = options.labels.map((key: any) => options.datasets[0].data[key] ? options.datasets[0].data[key] : 0)
    options.datasets[0].data = result
    isPieData.value = true
    orderNum.value = res.data.length
})
const dateChange = (val: any) => {
    getSigninList(staffs.value, dayjs(val).format('YYYY-MM-DD'))
}
const disabledDate = (time: Date) => {
    return time.getTime() > Date.now()
}
// const getIPAddress = async () => {
//     const response = await fetch('https://api.ipify.org?format=json');
//     const data = await response.json();
//     return data.ip;
// }

// const getLocationInfo = async () => {
//     const ipAddress = await getIPAddress();
//     const accessKey = '78024e0b03b59b9adf0af793977555a3'; // 替换为您自己的访问密钥
//     const response = await fetch(`http://api.ipstack.com/${ipAddress}?access_key=${accessKey}&language=zh`);
//     const data = await response.json();
//     console.log(data);

//     const { city } = data;
//     console.log(city);

//     return city
//     // console.log(`${country_name} ${region_name} ${city}`);
// }
const diaposeLeave = (name: string, S_id: string, dayNum: number, l_id: string, row: any) => {
    ElMessageBox.confirm(
        `员工：<strong>${name}</strong>申请批假<strong>${dayNum}</strong>天，是否批准？`,
        '批假申请',
        {
            dangerouslyUseHTMLString: true,
            distinguishCancelAndClose: true,
            confirmButtonText: '是',
            cancelButtonText: '否',
        }
    )
        .then(() => {
            editStaff([{ S_id, l_id }, { success: true }]).then(res => {
                row.success = true
                ElMessage({
                    type: 'success',
                    message: '已同意',
                })
            })
                .catch(err => {
                    ElMessage.error('服务器错误。')
                })
        })
        .catch((action: Action) => {
            if (action === 'cancel') {
                editStaff([{ S_id, l_id }, { success: false }]).then(res => {
                    console.log(res)
                    row.success = false
                    ElMessage({
                        type: 'error',
                        message: '已拒绝',
                    })
                })
                    .catch(err => {
                        ElMessage.error('服务器错误。')
                    })
            } else {
                ElMessage.info('暂不处理。')
            }

        })
}

const getSigninList = (staffs: [any], day: string) => {
    let staffsign;
    staffSignInList.value = staffs.map((item: any) => {
        staffsign = item.attendance.find((i: any) => dayjs(i.signInTime).format('YYYY-MM-DD') == day)
        if (staffsign) {
            return {
                _id: item._id,
                name: item.name,
                signInTime: staffsign
            }
        } else {
            return {
                _id: item._id,
                name: item.name,
                signInTime: null
            }
        }
    })
}


onMounted(async () => {
    // const city = await getLocationInfo()
    updateAdmin(userInfo, userInfo._id, {
        LoginRecord: {
            lastLoginTime: dayjs(),
            //  lastLoginLocation: city
            lastLoginLocation: '岳阳'
        }
    })
        .then(res => {
            console.log(res)
        })

})

</script>

<style scoped>
.el-row {
    margin-bottom: 20px;
}

.grid-content {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 30px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(100, 213, 114);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.user-info {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #ccc;
    margin-bottom: 20px;
}

.user-info-cont {
    padding-left: 50px;
    flex: 1;
    font-size: 14px;
    color: #999;
}

.user-info-cont div:first-child {
    font-size: 30px;
    color: #222;
}

.user-info-list {
    font-size: 14px;
    color: #999;
    line-height: 25px;
}

.user-info-list span {
    margin-left: 70px;
}

.mgb20 {
    margin-bottom: 20px;
}

.todo-item {
    font-size: 14px;
}

.todo-item-del {
    text-decoration: line-through;
    color: #999;
}

.schart {
    width: 100%;
    height: 300px;
}


.staffRecord {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.staffItem {
    width: 100px;
    height: 30px;
    margin: 5px 6px;
    line-height: 30px;
}

.staffItem .staffItem_name {
    margin: 0 5px;
    width: 65px;
    display: inline-block;
    vertical-align: middle;
}

.wrapper {
    width: 500px;
    height: 350px;
}
</style>
