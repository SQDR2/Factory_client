<template>
<div>
    <div class="container">
        <div class="staffDetail" v-if="ExistingID">
            <h2>员工详情</h2>
            <el-divider />
            <div class="detail">
                <div class="detail_txt">
                    <p><b>员工名称：</b>{{ staffDetail.name }}</p>
                    <p><b>年龄：</b>{{ staffDetail.age }}岁</p>
                    <p><b>性别：</b>{{ staffDetail.sex }}</p>
                    <p><b>联系方式：</b>{{ staffDetail.phone }}</p>
                    <p><b>推荐人：</b>{{ staffDetail.referrer ? staffDetail.referrer.name : '暂无' }}</p>
                    <p><b>是否在职：</b>
                        <el-tag class="ml-2" :type="staffDetail.onjob ? 'success' : 'danger'">{{ staffDetail.onjob ? '在职' :
                            '已离职' }}</el-tag>
                    </p>
                    <p v-if="staffDetail.onjob"><b>今日打卡：</b>
                        <el-button size="small" :disabled="todaySignIn" :type="todaySignIn ? 'success' : 'danger'" round
                            @click="SignOnBehalf">
                            {{ todaySignIn ? '已打卡' : '未打卡' }}
                        </el-button>
                    </p>

                </div>
                <div class="detail_painting" v-if="staffDetail.onjob">
                    <p><b>打卡记录：</b></p>
                    <div :style="{ width: '500px', border: '1px solid #d9d9d9', borderRadius: '4px' }">
                        <a-config-provider :locale="zhCN">
                            <a-calendar v-model:value="value" :fullscreen="false" @panelChange="onPanelChange">
                                <template #dateCellRender="{ current }">
                                    {{ dayjs().valueOf() >= dayjs(current).valueOf() ? allSignIn(current) ? '✔️' : '❌' : ''
                                    }}
                                    <!-- <el-tag ></el-tag> -->
                                </template>
                            </a-calendar>
                        </a-config-provider>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <el-alert title="请前往《员工管理》选择查看详情的员工" type="error" />
        </div>
    </div>
    <div>
        <el-card>
            <el-table :data="staffDetail.leaves" style="width: 100%">
                <el-table-column label="起止日期" width="280">
                    <template #default="{ row }">
                        {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') }}
                    </template>
                </el-table-column>
                <el-table-column prop="leaveNum" label="天数" width="100" />
                <el-table-column prop="reason" label="请假原因" width="400"/>
                <el-table-column label="是否通过">
                    <template #default="{ row }">
                        <el-tag class="ml-2" :type="row.success === null ? 'info' : row.success ? 'success' : 'danger'">{{
                            row.success
                            === null ? '未处理' : row.success ? '通过' : '未通过' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="处理">
                    <template #default="{ row }">
                        <el-button type="primary" :icon="Edit"
                            @click="diaposeLeave(staffDetail._id, row.leaveNum, row._id, row)" />
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs'
import { Dayjs } from 'dayjs'
import { editStaff, getStaff, sign } from '../../api/staff'
import { Action, ElMessage, ElMessageBox } from 'element-plus';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { Edit } from '@element-plus/icons-vue'
import 'dayjs/locale/zh-cn';

const props = defineProps({
    _id: String
})
//sessionStroage中存在_id
const ExistingID = ref(true)
const staffDetail: any = ref({})
const value = ref<Dayjs>();
const onPanelChange = (value: Dayjs, mode: string) => {
    console.log(value, mode);
};

const getStaffdetail = (_id: string) => {
    ExistingID.value = true
    getStaff(`_id=${_id}`).then(res => {
        console.log(res);
        staffDetail.value = res.data[0]
    })
}

if (!sessionStorage.getItem('s_id')) {
    ExistingID.value = true
    sessionStorage.setItem('s_id', props._id || "")
}
if (sessionStorage.getItem('s_id') === "") {
    ExistingID.value = false
    sessionStorage.removeItem('s_id')
}
let _id: string = sessionStorage.getItem("s_id") || ''
if (_id && _id !== '') {
    if (props._id === undefined) {
        getStaffdetail(_id)
    } else {
        sessionStorage.removeItem('s_id')
        sessionStorage.setItem('s_id', props._id || '')
        getStaffdetail(sessionStorage.getItem('s_id') || '')
    }
}
const todaySignIn = computed(() => {
    if (staffDetail.value.attendance && staffDetail.value.attendance.length > 0) {
        return dayjs(staffDetail.value.attendance[staffDetail.value.attendance.length - 1].signInTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    } else {
        return false
    }
})

const allSignIn = (day: any) => {
    if (staffDetail.value.attendance) {
        return staffDetail.value.attendance.some((signItem: any) =>
            dayjs(signItem.signInTime).format('YYYY-MM-DD') === dayjs(day).format('YYYY-MM-DD')
        )
    }
}
const SignOnBehalf = () => {
    // 二次确认删除
    ElMessageBox.confirm(`确定要帮${staffDetail.value.name}代签吗？`, '提示', {
        type: 'warning',
    })
        .then(() => {
            sign(staffDetail.value._id).then(res => {
                getStaffdetail(staffDetail.value._id)
                ElMessage.success(res.msg)
            }).catch(err => {
                ElMessage.error(err.msg)
            })
        })
        .catch(() => { })
}
const diaposeLeave = (S_id: string, dayNum: number, l_id: string, row: any) => {
    ElMessageBox.confirm(
        `员工：<strong>${staffDetail.value.name}</strong>申请批假<strong>${dayNum}</strong>天，是否批准？`,
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

</script>

<style scoped>
.detail {
    display: flex;
    flex-direction: row;

}

.detail_txt {
    width: 200px;
}

.detail_txt p {
    line-height: 40px;
}

.detail_painting {
    margin-left: 20px;
    display: flex;
    flex-direction: row;
}
</style>