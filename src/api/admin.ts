import  request from "../utils/request"

//最高级管理员查看全部管理员信息
export function getAdmin(info:any|null=null){
    return request({
        url: `/admin/getAdmin?${info}`,
        method: "GET"
    })
}
//删除管理员
export function deleteAdmin(data:any){
    return request({
        url:'/admin/deleteAdmin',
        method:'POST',
        data
    })
}

//新增管理员
export function addAdmin(data:any){
    return request({
        url:'/admin/addAdmin',
        method:'POST',
        data
    })
}

//编辑管理员
export function updateAdmin(updater:any, _id:any, newObj:any){
    return request({
        url:'/admin/updateAdmin',
        method:'POST',
        data:{
            updater,        //更新者
            _id,         //被更新者id
            newObj          //更新数据
        }
    })
}

//修改密码
export function changePW(_id:string,oldPW:string,newPW:string){
    return request({
        url:'/admin/changePW',
        method:'POST',
        data:{
            _id,
            oldPW,
            newPW
        }
    })
}

//更新头像
export function updatelogo(_id:string,url:string){
    return request({
        url:'/admin/updatelogo',
        method:'POST',
        data:{
            _id,
            url
        }
    })
}
