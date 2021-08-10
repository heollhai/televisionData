import { letterList } from "@/util/publicData";
//去除字母
function dislodgeLetter(str) {
  let result;
  const reg = /[a-zA-Z]+/; //[a-zA-Z]表示匹配字母，g表示全局匹配
  while ((result = str.match(reg))) {
    //判断str.match(reg)是否没有字母了
    str = str.replace(result[0], ""); //替换掉字母  result[0] 是 str.match(reg)匹配到的字母
  }
  return str;
}
//去除数字
function dislodgeNumber(str) {
  let result;
  const reg = /[0-9]+/; //
  while ((result = str.match(reg))) {
    //判断str.match(reg)是否没有字母了
    str = str.replace(result[0], ""); //替换掉字母  result[0] 是 str.match(reg)匹配到的字母
  }
  return str;
}
//将行,列转换成表格能接受的数据格式
function transformSheets(sheets) {
  const { Sheet1 } = sheets;
  //所有的列
  let sheet1_keys = Object.keys(Sheet1),
    content = [],
    //当前行的长度
    LINE_LENGHT = 0,
    //表格的最大行
    MAX_LINE_LENGHT = 0;
  //获取数据需要放置的对应位置，并标记
  sheet1_keys.forEach(ele => {
    if (ele !== "!ref" && ele !== "!margins") {
      //获取行的下标
      const index = dislodgeLetter(ele) - 1;
      const str = dislodgeNumber(ele);
      //获取 数据中字母最大的位数(最大行)
      LINE_LENGHT = letterList.indexOf(str);
      if (LINE_LENGHT === -1) {
        alert("超出publicData.js里面的letterList中数据");
      }
      //获取最大字母下标
      if (LINE_LENGHT > MAX_LINE_LENGHT) {
        MAX_LINE_LENGHT = LINE_LENGHT;
      }
      //当前列下的值
      const val = Sheet1[ele]["v"];
      !content[index] ? (content[index] = []) : "";
      const _obj = {};
      _obj[str] = val;
      val ? content[index].push(_obj) : "";
    }
  });
  //把数据装换为表格接受的格式
  let newContent = [];
  content.forEach(item => {
    let _obj = {};
    item.forEach(v => {
      Object.assign(_obj, v);
    });
    newContent.push({ ..._obj });
  });
  return { newContent, MAX_LINE_LENGHT };
}
export { transformSheets, dislodgeLetter, dislodgeNumber };
