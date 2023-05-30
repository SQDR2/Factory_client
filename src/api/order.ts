import request from '../utils/request'

export function getOrders(key: string | undefined = undefined) {
    return request({
        url: key === undefined ? '/order/getOrders' : `/order/getOrders?key=${key}`,
        method: 'GET'
    })
}

export function getSpecific(keys:[string]){
    return request({
        url: `/order/getSpecific?keys=${keys}`,
        method: 'GET'
    })
}

export function addOrder(data:any){
    return request({
        url:'/order/addOrder',
        method:'POST',
        data
    })
}

export function deleteOrder(_id:string){
    return request({
        url:'/order/deleteOrder',
        method:'POST',
        data:{_id}
    })
}

export function editOrder(_id:string|undefined,newObj:any){
    return request({
        url:'/order/editOrder',
        method:'POST',
        data:{
            _id,newObj
        }
    })
}