import request from '../utils/request';

export function getProducts(name: string | undefined = undefined) {
    return request({
        url: name === undefined ? '/product/getProducts' : `/product/getProducts?name=${name}`,
        method: 'GET'
    })
}

export function addProduct(name: string, img_url: string[], supplier_id: string, price: number) {
    return request({
        url: '/product/addProduct',
        method: 'POST',
        data: supplier_id ? {
            name,
            img_url,
            supplier_id,
            price
        } : {
            name,
            img_url,
            price
        }
    })
}

export function deleteProduct(_id: string) {
    return request({
        url: '/product/deleteProduct',
        method: 'POST',
        data: { _id }
    })
}

export function updateProduct(_id: string|undefined, newObj: any) {
    return request({
        url: '/product/updateProduct',
        method: 'POST',
        data: {
            _id, newObj
        }
    })
}