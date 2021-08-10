//获取路径下的文件 最新日志下第一个表
// name 文件名
// 有名称返回对应名称字段，没有返回文件下的第一个
function getLogDataFileName(name) {
  const xlsx = require.context("../../public/logData/", true, /\.(xlsx)/);
  const files = xlsx.keys();
  if (files?.length) {
    const newFiles = [];
    if (name) {
      //返回对应文件下的xlsx文件
      files.forEach(item => {
        if (item.indexOf(name) !== -1) {
          newFiles.push(item);
        }
      });
      return {
        path: `./logData${newFiles[0].substring(1, newFiles[0].length)}`,
        drawingName: wipeOffSuffix(newFiles[0], 2)
      };
    }
    return {
      path: `./logData${files[0].substring(1, files[0].length)}`,
      drawingName: wipeOffSuffix(files[0], 2)
    };
  } else {
    alert("没有对应的数据");
  }
}
//去除后缀
function wipeOffSuffix(str, num) {
  return str.substring(num || 1, str.lastIndexOf("."));
}
//获取图纸
function getDrawingImg(name) {
  const ctx = require.context("../../public/drawing", true, /\.(jpg|jpeg)$/);
  const files = ctx.keys();
  if (files?.length) {
    let path = "";
    name = name.replace("/", "_");
    files.forEach(item => {
      if (wipeOffSuffix(item, 2) === name) {
        path = item.substring(1, item.length);
      }
    });
    return path;
  } else {
    alert("没有图纸数据");
  }
}
export { getLogDataFileName, getDrawingImg };
