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
            }
        ]
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
