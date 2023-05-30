<template>
    <div class="container">
        <el-tabs type="border-card" v-model="activeTab">
            <el-tab-pane label="权限角色">
                用户角色身份：
                
                <el-tag effect="dark" :type="tag_obj[userInfo.Perm_id.Permission_role]" size="large">
                    {{ userInfo.Perm_id.Permission_role }}
                </el-tag>
                <el-divider />
                <div v-for="item in data" :key="item[0].id">
                    <el-tree :data="item[0]" show-checkbox node-key="id" :default-checked-keys="item[1]"
                        :default-expanded-keys="[userInfo.Perm_id._id]" :props="{ class: customNodeClass }">
                        <template v-slot="{ node }">
                            <span>{{ node.label }}</span>
                            <div class="operate" v-if="role_arr[0].includes(node.key)">
                                <el-button size="small" type="primary" :icon="Edit"
                                    @click.stop="editRole(node)"></el-button>
                                <el-button size="small" type="warning" :icon="Delete"
                                    @click.stop="deleteRole(node.key)"></el-button>
                            </div>
                        </template>
                    </el-tree>
                </div>
            </el-tab-pane>
            <el-tab-pane label="添加角色">
                <div class="addPerm">
                    <div class="Perm_input">
                        <el-input v-model="role_name" placeholder="请输入新增权限角色名称">
                            <template #prepend>
                                <i class="iconfont icon-Perm_role"></i>
                            </template>
                        </el-input>
                        <el-button type="primary" @click="addPermRole">添加</el-button>
                    </div>
                    <p>请选择角色权限：</p>
                    <el-tree ref="treeRef" :data="all_Perm" show-checkbox accordion node-key="id" />
                </div>
            </el-tab-pane>
            <el-tab-pane label="修改角色" :disabled="activeTab === '2' ? true : ''">
                <div class="Perm_input">
                    <el-input v-model="edit_Role.label" placeholder="请修改角色名称">
                        <template #prepend>
                            <i class="iconfont icon-Perm_role"></i>
                        </template>
                    </el-input>
                    <el-button type="primary" @click="eidt">修改</el-button>
                </div>
                <el-tree ref="treeRef" :data="all_Perm" show-checkbox accordion node-key="id"
                    :default-checked-keys="edit_Role.defaultCheck"></el-tree>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts" name="permission">
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue'
import { getPerm, addPerm, deletePerm, editPerm } from '../../api/permission'

interface Tree {
    label: string,
    children?: Tree[],
    disabled?: boolean,
    id: string,
    isPenultimate?: boolean
}

let Admin_children: Tree = { label: '管理员权限', id: 'Admin', children: [], isPenultimate: true, disabled: true }
let Perm_children: Tree = { label: '权限角色', id: 'Perm', children: [], isPenultimate: true, disabled: true }
let Staff_children: Tree = { label: '员工权限', id: 'Staff', children: [], isPenultimate: true, disabled: true }
let Supplier_children: Tree = { label: '供应商权限', id: 'Supplier', children: [], isPenultimate: true, disabled: true }
let Product_children: Tree = { label: '产品权限', id: 'Product', children: [], isPenultimate: true, disabled: true }
let Order_children: Tree = { label: '订单权限', id: 'Order', children: [], isPenultimate: true, disabled: true }
let Orther_children: Tree = { label: '其他权限', id: 'Other', children: [], isPenultimate: true, disabled: true }

const tag_obj: { [key: string]: string } = {
    "董事": '',
    "经理": "success",
    "部长": 'warning',
    "主管": "info"
}
let userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '')

//每个权限角色下面所有的权限
const data: Tree[][] = reactive([]);
const customNodeClass = (data: Tree, node: Node) => {
    if (data.isPenultimate) {
        return 'is-penultimate'
    }
    return null
}

//添加权限角色的树形控件绑定数据
const all_Perm = ref<Tree[]>([])
//添加角色时角色名称
const role_name = ref('')
//修改角色时使用的树形控件的实例
const treeRef: any = ref(null);
//每个角色的id和权限
const role_arr = ref<string[][]>([])

//当前被激活标签页
const activeTab = ref('0')
//当前被修改的角色信息
const edit_Role: any = ref({})

//获取全部权限
const getPermRolelist = () => {
    //数据初始化
    data.splice(0, data.length)
    role_arr.value = [[], []]
    all_Perm.value = []
    //获取数据
    getPerm().then(res => {
        //所有子节点
        let children: Tree[] = []
        //被选中的数组
        res.data.forEach((element: any, index: number) => {
            //角色id组成的数组，用于v-if展示修改和删除按钮
            role_arr.value[0].push(element._id)
            role_arr.value[1].push(element.permissions)
            // roleId_arr.value[1].push()
            //生成所有的权限子节点 在每一个权限角色展示所有的权限子节点
            if (element.Permission_role === '董事') {
                if (Admin_children.children!.length === 0) {
                    element.permissions.forEach((item: any) => {
                        if (item.includes('Admin')) {
                            Admin_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else if (item.includes('Perm')) {
                            Perm_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else if (item.includes('Staff')) {
                            Staff_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else if (item.includes('Supplier')) {
                            Supplier_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else if (item.includes('Product')) {
                            Product_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else if (item.includes('Order')) {
                            Order_children.children!.push({ label: item, children: [], id: item, disabled: true })
                        } else {
                            Orther_children.children!.push({ label: item, children: [], id: item })
                        }
                    })
                }
                children.push(Admin_children, Perm_children, Staff_children,
                    Supplier_children, Product_children, Order_children, Orther_children)
            }
            //生成被每一个权限子节点被选择的数组
            data.push([[{
                disabled: true, label: element.Permission_role,
                id: element._id, children: children
            }], element.permissions])
        });
        //将所有权限保存，作为添加权限的生成树
        all_Perm.value.push(
            JSON.parse(JSON.stringify(Admin_children)),
            JSON.parse(JSON.stringify(Perm_children)),
            JSON.parse(JSON.stringify(Staff_children)),
            JSON.parse(JSON.stringify(Supplier_children)),
            JSON.parse(JSON.stringify(Product_children)),
            JSON.parse(JSON.stringify(Order_children)),
            JSON.parse(JSON.stringify(Orther_children)),
        )
        optional(all_Perm.value)
    }).catch(err => {
        console.log(err);
        ElMessage.error('网络质量不佳！请检查网络！')
    })
}

//添加权限
const addPermRole = () => {
    let permissions = treeRef.value.getCheckedNodes(true, false).map((item: any) => {
        return item.id
    })
    addPerm({ Permission_role: role_name.value, permissions }).then(res => {
        ElMessage.success(res.msg)
        //将选中的清空
        treeRef.value.setCheckedNodes([])
        role_name.value = ''
        getPermRolelist()
        activeTab.value = '0'
    })

}

//删除角色
const deleteRole = (_id: string) => {
    // 二次确认删除
    ElMessageBox.confirm('确定要删除当前选择的角色吗？', '提示', {
        type: 'warning',
    })
        .then(() => {
            deletePerm(_id).then(res => {
                ElMessage.success(res.msg)
                getPermRolelist()
            }).catch(err => {
                ElMessage.error(err.msg)
            })
        })
}

//点击修改权限跳转到标签页
const editRole = (node: any) => {
    treeRef.value.setCheckedKeys([])
    edit_Role.value = {}
    edit_Role.value = { ...node.data }
    edit_Role.value.defaultCheck = node.store.defaultCheckedKeys
    activeTab.value = '2'
}

//确定修改
const eidt = () => {
    ElMessageBox.confirm('确定要修改当前角色权限吗？', '提示', {
        type: 'warning',
    }).then(() => {
        let permissions = treeRef.value.getCheckedNodes(true, false).map((item: any) => {
            return item.id
        })
        editPerm(
            edit_Role.value.id,
            { Permission_role: edit_Role.value.label, permissions }
        ).then(res => {
            getPermRolelist()
            activeTab.value = '0'
            ElMessage.success(res.msg)
        }).catch(err => {
            activeTab.value = '0'
            ElMessage.error(err.msg)
        })
    })
}

//将全部权限数组设置为不可选择  disabled去除
const optional = (arr: any) => {
    arr.forEach((item: any) => {
        item.disabled = false
        if (item.children.length !== 0) {
            optional(item.children)
        }
    })
}

// const editRole_PermRef = ref(editRole_Perm)
//挂载钩子函数
onMounted(() => {
    getPermRolelist()
})

</script>

<style>
.el-tree-node.is-expanded.is-penultimate>.el-tree-node__children {
    display: flex;
    flex-direction: row;
}

.is-penultimate>.el-tree-node__children>div {
    width: 25%;
}

.el-tag {
    font-size: 13px;
}

.Perm_input .el-input {
    width: 250px;
}

.Perm_input .el-button {
    margin: 5px;
}

.Perm_input {
    display: flex;
    align-items: center;
}

.operate {
    margin-left: 100px;
}
</style>
