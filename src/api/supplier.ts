import request from '../utils/request';

export function getSupplier(name:string|undefined=undefined){
    return request({
        url:name===undefined?'/supplier/getSupplier':`/supplier/getSupplier?name=${name}`,
        method:'GET'
    })
}
export function addSupplier(data:any){
    return request({
        url:'/Supplier/addSupplier',
        method:'POST',
        data
    })
}

export function deleteSupplier(_id:string){
    return request({
        url:'/Supplier/deleteSupplier',
        method:'POST',
        data:{_id}
    })
}

export function updateSupplier(_id:any,newObj:any){
    return request({
        url:'/Supplier/updateSupplier',
        method:'POST',
        data:{
            _id,
            newObj
        }
    })
}