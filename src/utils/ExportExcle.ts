import * as XLSX from 'xlsx';
import { CodeToText } from 'element-china-area-data'
import dayjs from 'dayjs';

export default function (tableData: any, listArr: string[], ExcleName: string, valueArr: string[]) {
    //总数据 tableData
    //表头 listArr
    //excle的文件名称 ExcleName
    //数据的key valueArr
    const list = [listArr]
    //日期正则
    const dateReg = new RegExp('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z');
    tableData.value.map((item: any, i: number) => {
        const arr: any[] = [i + 1];
        let ExcleItem = valueArr.map((element: string) => {
            let propValue = item[element];
            if (typeof propValue == 'object') {
                if (element === 'o_product') {
                    return (propValue.map((product: any) => product.name)).join()
                } else if (element === 'c_location' || element === 'location') {
                    return CodeToText[propValue[0]] + ' ' + CodeToText[propValue[1]] + ' ' +
                        CodeToText[propValue[2]]
                } else if (element === 'supplier_id') {
                    return propValue.name
                }else if(element === 'sl_product'){
                    return (propValue.map((item:any)=>item.name)).join()
                } 
                else {
                    if (propValue == null) {
                        return ''
                    }
                    return JSON.stringify(propValue);
                }
            } else if (typeof propValue === 'boolean') {
                return propValue ? '是' : '否'
            }
            else {
                if (dateReg.test(propValue)) {
                    return dayjs(propValue).format('YYYY-MM-DD HH:mm:ss')
                }
                return propValue;
            }
        })
        arr.push(...ExcleItem);
        list.push(arr);
    });
    let WorkSheet = XLSX.utils.aoa_to_sheet(list);
    let new_workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
    XLSX.writeFile(new_workbook, `${ExcleName}.xlsx`);
    // const WorkSheet = XLSX.utils.aoa_to_sheet(list);
    // const new_workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
    // const wbout = XLSX.write(new_workbook, {bookType:'xlsx', bookSST:false, type: 'binary'});
    // const blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
    // saveAs(blob, `${ExcleName}.xlsx`);
}