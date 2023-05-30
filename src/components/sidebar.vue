<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="sidebar.collapse" background-color="#324157"
            text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in items" :key="item.icon">
                <template v-if="item.subs">
                    <el-sub-menu :index="item.index" :key="item.index" v-permiss="item.permiss">
                        <i :class="'iconfont ' + item.icon"></i>
                        <template #title>{{ item.title }}</template>
                        <template v-for="subItem in item.subs" :key="subItem.icon">
                            <el-menu-item :index="subItem.index" v-permiss="item.permiss">
                                {{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="'iconfont ' + item.icon"></i>
                        <template #title>{{ item.title }}</template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSidebarStore } from "../store/sidebar";
import { useRoute } from "vue-router";
interface Side {
    icon: string,
    index: string,
    title: string,
    permiss?: string,
    subs?: any[]
}
const items: Side[] = [
    {
        icon: "icon-shouye",
        index: "/dashboard",
        title: "系统首页",
        permiss: "1",
    },
    {
        icon: "icon-staff",
        index: "/staff",
        title: "员工管理",
    },
    {
        icon: "icon-admin",
        index: "/admin",
        title: "管理员",
    },
    {
        icon: "icon-Perm_role",
        index: "/Perm",
        title: "权限角色",
    }, {
        icon: 'icon-supplier',
        index: '/supplier',
        title: '供应商'
    }, {
        icon: 'icon-products',
        index: '/product',
        title: '产品管理'
    }, {
        icon: 'icon-orders',
        index: '/order',
        title: '订单展示'
    }
];

const route = useRoute();
const onRoutes = computed(() => { 
    return route.path;
});
   
const sidebar = useSidebarStore();
const userRoutelist = JSON.parse(sessionStorage.getItem('userInfo')!).Perm_id.routers
const sidebarItems :Side[] =[];
// items.

// console.log(sidebarItems);

</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar>ul {
    height: 100%;
}

.iconfont {
    margin: 10px 10px 10px 0;
}
</style>
