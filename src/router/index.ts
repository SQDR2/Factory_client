import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/home.vue';


const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {
                    title: '系统首页',  
                },
                component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
            },
            {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心',
                },
                component: () => import(/* webpackChunkName: "user" */ '../views/user/user.vue'),
            },
            {
                path: '/staff',
                name: 'staff',
                meta: {
                    title: '员工管理'
                },
                component: () => import(/* webpackChunkName: "staff" */ '../views/staff/staff.vue')
            }, {
                path: '/order',
                name: 'order',
                meta: {
                    title: '订单管理'
                },
                component: () => import(/* webpackChunkName: "order" */ '../views/order/order.vue')
            },
            {
                path: '/admin',
                name: 'admin',
                meta: {
                    title: '管理员'
                },
                component: () => import(/* webpackChunkName: "admin" */ '../views/admin/admin.vue')
            },
            {
                path: '/Perm',
                name: 'Perm',
                meta: {
                    title: '权限角色'
                },
                component: () => import(/* webpackChunkName: "permission" */ '../views/permission/permission.vue')
            },
            {
                path: '/supplier',
                name: 'supplier',
                meta: {
                    title: '供应商'
                },
                component: () => import(/* webpackChunkName: "permission" */ '../views/supplier/supplier.vue')
            }, {
                path: '/product',
                name: 'product',
                meta: {
                    title: '产品管理'
                },
                component: () => import(/* webpackChunkName: "product" */ '../views/product/product.vue')
            },
            {
                path: '/PDetail',
                name: 'PDetail',
                meta: {
                    title: '产品详情'
                },
                props: true,
                component: () => import(/* webpackChunkName: "PDetail" */ '../views/product/productDetail.vue')
            }, {
                path: '/ODetail',
                name: 'ODetail',
                meta: {
                    title: '订单详情'
                },
                props: true,
                component: () => import(/* webpackChunkName: "ODetail" */ '../views/order/OrderDetail.vue')
            }, {
                path: '/SDetail',
                name: 'SDetail',
                meta: {
                    title: '员工详情'
                },
                props: true,
                component: () => import(/* webpackChunkName: "SDetail" */ '../views/staff/staffDetail.vue')
            }
        ],
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: () => import(/* webpackChunkName: "login" */ '../views/login/login.vue'),
    },
    {
        path: '/403',
        name: '403',
        meta: {
            title: '没有权限',
        },
        component: () => import(/* webpackChunkName: "403" */ '../views/403.vue'),
    }
];



const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | 后台管理系统`;
    // let userInfo = JSON.parse(sessionStorage.getItem("userInfo")||'');
    //获取token
    const token: string | null = sessionStorage.getItem("token")
    if (!token && to.path !== "/login") {
        next("/login");
    } else if (!to.meta.permession) {
        next()
    }
    // else if(to.meta.permission !== Number(userInfo!.identity)){
    //     next("/403")
    // }
    // else{
    //     if(to.path === '/login'){
    //         next();
    //     }else if(PermList.includes(to.path.slice(1))){
    //         next();
    //     }else{
    //         //如果没有权限，则进入403
    //         next("/403")
    //     }
    // }
    else {
        next()
    }
});



export default router;
