import  request from "../utils/request"

//获取全部权限
export function getPerm(){
    return request({
        url:'/perm/getPerm',
        method:'GET'
    })
}

//添加权限角色
export function addPerm(data:any){
    return request({
        url:'/Perm/addPerm',
        method:'POST',
        data
    })
}

//删除当前权限角色
export function deletePerm(_id:string){
    return request({
        url:'/Perm/deletePerm',
        method:'POST',
        data:{_id}
    })
}

//修改角色权限
export function editPerm(old_id:string,newObj:any){
    return request({
        url:'/Perm/editPerm',
        method:'POST',
        data:{
            old_id,
            newObj
        }
    })
}