import axios from "axios";
import {  ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
// 处理  类型“AxiosResponse<any, any>”上不存在属性“errorinfo”。ts(2339) 脑壳疼！关键一步。
declare module "axios" {
    interface AxiosResponse<T = any> {
        token: string,
        msg: string,
        code: number
        // 这里追加你的参数
    }
    export function create(config?: AxiosRequestConfig): AxiosInstance;
}
const router = useRouter();
const baseURL = "http://127.0.0.1:2580/"
//创建axios实例
const service = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        "Content-type": "application/json;charset=utf-8"
    }
})

//请求拦截
service.interceptors.request.use((config) => {
    config.headers = config.headers || {}
    if (sessionStorage.getItem("token")) {
        let userInfo = sessionStorage.getItem('userInfo')
        let PermList = JSON.parse(userInfo || '').Perm_id.permissions
        config.headers.authorization = `Beaer ${sessionStorage.getItem("token") || ""}`
        // typeof config.headers.set === "function" &&  config.headers.set("token",sessionStorage.getItem("token") || "");
        config.headers.permlist = PermList
    }
    return config
},
    error => {
        return Promise.reject(error);
    })

//响应拦截
service.interceptors.response.use(({ data }) => {
    const code: number = data.code;
    if (code != 200) {
        return Promise.reject(data);
    }
    return data;
},   error => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      // token过期，弹出提示框
      ElMessageBox.alert('登录验证已过期，请重新登录', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          // 跳转到登录页面
          router.replace({
            name: 'login',
            query: {
              redirect: router.currentRoute.value.fullPath
            }
          });
        }
      });
    }
    return Promise.reject(error);
  })

export default service
