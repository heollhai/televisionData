import XLSX from "xlsx";
import XlsxPopulate from "xlsx-populate";
import { letterList } from "@/util/publicData";
/**
 * 导出excel
 * @param {*} dom table元素
 * @param {*} colLength 列数量
 * @param {*} rowLength 行数量
 * @param {*} fileName 文件名
 */
function exportExcel(dom, colLength, rowLength, fileName) {
  //根据数字获取对应的字母
  const getLetter = function(num) {
    return letterList[num - 1];
  };
  //此方法根据dom结构生成excel文档,先判断有无固定列，有固定列的话有两个table，会导致重复数据
  let workbook;
  workbook = XLSX.utils.table_to_book(dom, { raw: true });
  //设置列宽度为19
  const wscols = [];
  for (let i = 0; i < colLength; i++) {
    wscols.push({ wch: 19 });
  }
  workbook.Sheets[workbook.SheetNames[0]]["!cols"] = wscols;
  //此时wbout 是一个拥有结构的excel文件 可以看下结构
  const wbout = XLSX.write(workbook, {
    bookType: "xlsx",
    bookSST: true,
    type: "array"
  });
  //通过XlsxPopulate修改excel样式
  XlsxPopulate.fromDataAsync(wbout).then(res => {
    const currentExcel = res.sheet(0);
    //通用设置参数
    const params = {
      border: {
        color: "000000",
        style: "thin"
      },
      horizontalAlignment: "left",
      verticalAlignment: "center"
    };
    //设置标题头
    const baseRow = Math.floor(colLength / 26);
    let letter;
    if (baseRow >= 1) {
      letter = getLetter(baseRow) + getLetter(colLength % 26);
    } else {
      letter = getLetter(colLength);
    }
    const headerRow = `A1:${letter}1`;
    currentExcel.range(headerRow).style({
      // bold: true,
      // fontSize: 13,
      ...params
      // horizontalAlignment: "center"
    });
    //设置内容行
    const dataRow = `A2:${letter}${rowLength}`;
    currentExcel.range(dataRow).style({
      fontSize: 10.5,
      ...params
    });
    // 调用浏览器原生的导出功能
    res.outputAsync().then(function(blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  });
}
export default exportExcel;
