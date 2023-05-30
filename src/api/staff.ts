import request from '../utils/request';

//获取全部员工数据
export function getStaff(info:any|null=null){
    return request({
        url: `/staff/getStaff?${info}`,
        method: "GET"
    })
}
//修改员工信息
export function editStaff(data:any){
    return request({
        url:"/staff/editStaff",
        method:'POST',
        data
    })
}
//删除某个员工
export function deleteStaff(data:any){
    return request({
        url:'/staff/deleteStaff',
        method:'POST',
        data
    })
}
//新增员工
export function addStaff(data:any){
    return request({
        url:'/staff/addStaff',
        method:'POST',
        data
    })
}
//员工签到
export function sign(_id:string){
    return request({
        url:'/sign',
        method:'POST',
        data:{_id}
    })
}