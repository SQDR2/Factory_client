export default function (routerArr: any) {
    const arouters = routerArr.map((item: any) => {
        if (item.route === "PDetail") {
            return {
                path: `/${item.route}`,
                name: item.route,
                meta: {
                    title: item.title
                },
                props: true,
                component: () => import(/* webpackChunkName: "PDetail" */ '../views/product/productDetail.vue')
            }
        } else if (item === "ODetail") {
            return {
                path: `/${item.route}`,
                name: item.route,
                meta: {
                    title: item.title
                },
                props: true,
                component: () => import(/* webpackChunkName: "ODetail" */ '../views/order/OrderDetail.vue')
            }
        } else if (item === "Setail") {
            return {
                path: `/${item.route}`,
                name: item.route,
                meta: {
                    title: item.title
                },
                props: true,
                component: () => import(/* webpackChunkName: "SDetail" */ '../views/staff/staffDetail.vue')
            }
        } else {
            return {
                path: `/${item.route}`,
                name: item.route,
                meta: {
                    title: item.title
                },
                props: true,
                component: () => import(/* webpackChunkName: "SDetail" */ `../views/${item.route}/${item.route}.vue`)
            }
        }
    })
    return arouters;
}