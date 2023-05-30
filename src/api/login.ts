import request from '../utils/request';

// 登录接口
export function login(data:any) {
    return request({
        url: "/login",
        method: "POST",
        data:{
            phone:data.phone,
            password:data.password
        }
    })
}

//获取权限中文名称
export function getPermName(data:any){
    return request({
        url: "/Perm/getPermName",
        method: "POST",
        data
    })
}
