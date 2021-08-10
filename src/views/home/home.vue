<!--  -->
<template>
  <div style="height:100%;">
    <table-view
      :tableData="tableData"
      :colTitle="colTitle"
      :lineLength="MAX_LINE_LENGHT"
      @search="getTableData"
    ></table-view>
    <canvas-draw
      :atPresentPicture="atPresentPicture"
      :config="config"
      :graphData="graphData"
      :pagingIndex="0"
      @save="save"
    >
    </canvas-draw>
  </div>
</template>

<script>
import axios from "axios";
import XLSX from "xlsx";
import TableView from "@/components/table/Table";
import { letterList } from "@/util/publicData";
import { transformSheets } from "@/util/read_xlsx"; //导入转制函数
import { getLogDataFileName, getDrawingImg } from "@/util/allFiles";
import CanvasDraw from "@/components/canvas/Canvas.vue";

export default {
  components: { TableView, CanvasDraw },
  data() {
    return {
      //表格的数据
      tableData: [],
      //表格标题
      colTitle: [],
      //表格的最大行
      MAX_LINE_LENGHT: 0,
      //图纸
      atPresentPicture: "",
      //图纸文件名
      drawingName: "",
      //canvas是否显示
      configType: true,
      graphData: [],
      //canvas宽
      config: {
        width: 0,
        height: 0
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    save(val) {
      console.log(val, "valkkkk");
    },
    init() {
      this.getTableData();
    },
    getImgInfo() {
      let img = new Image();
      const path = getDrawingImg(this.drawingName);
      this.$nextTick(() => {
        //获取文件大小
        img.src = require(`../../../public/drawing${path}`);
        this.atPresentPicture = img.src;
        this.configType = false;
        img.onload = () => {
          this.config = {
            width: img.width,
            height: img.height
          };
          this.configType = true;
        };
      });
    },
    //获取最新的表格数据
    async getTableData(name) {
      let file = "";
      if (name) {
        const { size, type } = name;
        file = getLogDataFileName(`${size}/${type}`);
      } else {
        file = getLogDataFileName();
      }
      const { path, drawingName } = file;
      //图纸的名称
      this.drawingName = drawingName;
      //获取最新的日志数据
      const res = await this.getApiData(path);
      //读取二进制excel文件,参考https://github.com/SheetJS/js-xlsx#utility-functions
      const data = new Uint8Array(res.data),
        wb = XLSX.read(data, { type: "array" }),
        sheets = wb.Sheets,
        { newContent, MAX_LINE_LENGHT } = transformSheets(sheets);
      this.tableData = newContent;
      this.colTitle = [];
      this.MAX_LINE_LENGHT = MAX_LINE_LENGHT;
      letterList.forEach((element, index) => {
        if (index <= MAX_LINE_LENGHT) {
          this.colTitle.push({
            prop: element,
            label: element
          });
        }
      });
      this.$nextTick(() => {
        this.getImgInfo();
      });
    },
    //获取的数据
    getApiData(url) {
      console.log(url, "res");
      return new Promise(resolve => {
        axios
          .get(url, {
            responseType: "arraybuffer"
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            console.log(err);
          });
      });
    }
  }
};
</script>
