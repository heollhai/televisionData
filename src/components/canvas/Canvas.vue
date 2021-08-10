<template>
  <div style="height:calc(100% - 70px);" class="right-content">
    <add-dialog
      ref="canvasDialog"
      @save="save"
      :title="dialogName"
    ></add-dialog>
    <div class="canvas-box" ref="canvasBox">
      <span v-if="atPresentPicture === ''" style="font-size:18px;">
        暂无图纸</span
      >
      <canvas
        :class="{ 'drag-and-drop': KeydownType }"
        v-drag="KeydownType"
        :style="{
          background:
            'url(' +
            atPresentPicture +
            ') 0% 0% / 100% 100% no-repeat no-repeat'
        }"
        id="my-canvas"
        :width="dynamic.width"
        :height="dynamic.height"
        ref="mycanvas"
        @mousedown="canvasDown"
        @mousemove="canvasMove"
        @mouseup="canvasUp"
        @dblclick="canvasDblclick"
        @click="canvasClick"
        @mouseenter="canvasMouseleave"
        @contextmenu="canvascontextmenu"
      >
      </canvas>
    </div>
    <!-- 左侧区域 -->
    <div class="instrument" v-show="instrumentType">
      <div :class="dynamicHeight()">
        <i
          v-for="(item, index) in operatingSpace"
          :key="item.id"
          :title="item.title"
          :class="operatingColor(item, index)"
          @click="operatingSpaceClick(item.id, index)"
        ></i>
      </div>
      <div>
        <i class="el-icon-minus" @click="pictureReduce"></i>
        <div>
          <span :style="{ top: progressValue + 'px' }"></span>
        </div>
        <i class="iconfont iconxinzeng" @click="pictureAdd"></i>
      </div>
    </div>

    <!-- 点击绘制区域展示内容  -->
    <div
      class="compile-shwo"
      v-if="compileType"
      :style="compileType ? { position: 'fixed', top: Y, left: X } : ''"
    >
      <span @click="compileSstoreMessage({ act: '0' })" v-show="showRule()"
        >编辑信息</span
      >
      <span @click="adjustment" v-show="adjustmentSizeShowRule()">{{
        adjustmentName
      }}</span>
      <span @click="deleteStore" v-show="showRule()">删除</span>
      <span @click="locationTable" v-show="locationTableShowRule()">{{
        locationTableName
      }}</span>
      <span @click="bunkWorkbench" v-show="workbenchShowRule()"
        >铺位工作台</span
      >
    </div>
  </div>
</template>
<script>
import AddDialog from "./Dialog";
export default {
  components: { AddDialog },
  props: {
    associatedData: {
      type: Object,
      default: () => {}
    },
    //楼层数据
    graphData: {
      type: Array,
      default: () => {}
    },
    //楼层图纸
    atPresentPicture: {
      type: String,
      default: ""
    },
    //宽高
    config: {
      type: Object,
      default: () => {}
    },
    //楼层
    pagingIndex: {
      type: Number,
      default: 0
    },
    //权限
    jurisdiction: String
  },
  data() {
    return {
      //弹框标题
      dialogName: "",

      message: 0,
      //右侧工具栏是否显示
      instrumentType: true,
      //标签位置是否在调整
      locationTableType: true,
      //空格按下事件
      KeydownType: false,
      //鼠标放上效果
      hoverType: false,
      //编辑窗口是否打开
      compileType: false,
      //是否绘制
      startDrawType: false,
      //获取店铺信息
      StoreInformationType: false,
      //是否触发移动事件
      onmousemoveType: false,
      //是否调整大小
      adjustmentType: false,
      //是否是双击进入
      iSdblclick: false,
      //单双击事件
      time: null,
      //点击时标签位置
      clickLocation: null,
      //画布
      canvas: null,
      X: "", //x轴坐标
      Y: "", //Y轴坐标
      //canvas内容
      context: "",
      //标签位置名称
      locationTableName: "调整标签位置",
      adjustmentName: "调整大小",
      //正在调整大小的铺位编号
      adjustmentCode: "",
      //鼠标移动在那个上面
      hoverGraphListKey: "",
      //选中的店铺
      graphListKey: "",
      //可以缩放比
      resizePercentage: 200,
      //是否是第一次点击
      startClick: 0,
      //操作区激活的按钮
      operatingSpaceIndex: -1,
      //动态宽高执行的次数
      dynamicTime: 0,
      //记录每次改变动态宽高执行的次数
      recordDynamicTime: 0,
      //滚动的次数
      keydownNum: 0,
      progressValue: 30,
      progressValueMax: 60,
      //拖拽的是哪一个圆
      canvasDrag: [],
      //草图 x y 轴数据
      graph: [],
      //动态的宽高
      dynamic: {
        width: 0,
        height: 0
      },
      initConfig: {
        fillStyle: "rgba(178,231,232,0.5)", //空铺 填充颜色  蓝色
        beingDecoratedColor: "red", //装修中 招商锁定
        strokeStyle: "rgba(178,231,232,0.5)", //空铺边框颜色
        drawClickColor: "#02B2B5",
        transparency: "rgba(254,0,0,0.5)",
        hoverColor: "#F58098", //鼠标放上颜色
        rentOutFill: "rgba(255,142,81,0.5)", //出租后填充颜色
        rentOutStroke: "rgba(255,142,81,0.5)", //出租填充边框
        lineWidth: 2, //宽度
        titleStyle: {
          //标题
          // color: '#303133',
          color: "#000",
          size: 20
        }
      }
    };
  },
  computed: {
    //操作区
    operatingSpace: function() {
      return [
        { icon: "iconfont el-icon-plus", id: "1", title: "编辑楼层" },
        { icon: "iconfont el-icon-s-help", id: "3", title: "划铺" }
      ];
    },
    // 图形的比例配合页面  进行缩小放大
    graphList: function() {
      const title = {
        x: "",
        y: ""
      };
      return JSON.parse(JSON.stringify(this.graphData)).map(item => {
        if (!item.title) {
          item.title = title;
        }
        const { x, y } = item.title;
        item.title = Object.assign(item.title, {
          x: x * this.proportion,
          y: y * this.proportion
        });
        if (item?.XY) {
          item.XY = item.XY.map(ele => {
            return {
              x: ele.x * this.proportion,
              y: ele.y * this.proportion
            };
          });
        }
        return item;
      });
    },
    //canvas的缩放比例
    proportion: function() {
      return (
        (this.resizePercentage - this.recordDynamicTime) / this.resizePercentage
      );
    },
    //还原比例
    newProportion: function() {
      return (
        this.resizePercentage / (this.resizePercentage - this.recordDynamicTime)
      );
    },
    //图片的大小
    pictureSize: function() {
      return this.resizePercentage - this.recordDynamicTime;
    }
  },
  methods: {
    save(val) {
      this.$emit("save", val);
    },
    //调整大小显示规则
    adjustmentSizeShowRule() {
      return this.jurisdiction === "1" && this.locationTableType;
    },
    //标签位置调整显示规则
    locationTableShowRule() {
      return this.jurisdiction === "1" && !this.adjustmentType;
    },
    //工作台显示规则
    workbenchShowRule() {
      return !this.adjustmentType && this.locationTableType;
    },
    //右键菜单显示规则
    showRule() {
      return (
        this.jurisdiction === "1" &&
        !this.adjustmentType &&
        this.locationTableType
      );
    },
    //左侧操作栏的动态高度
    dynamicHeight() {
      return [this.jurisdiction === "0" ? "no-authority" : "have-authority"];
    },
    disabled() {
      return [this.jurisdiction === "0" ? "color-disabled" : "color-disabled"];
    },
    operatingColor(item, index) {
      return [
        this.operatingSpaceIndex === index
          ? "operatingColor" + " " + item.icon
          : item.icon
      ];
    },
    //铺位工作台
    bunkWorkbench() {
      const Code = {
        v_DialogCode: "CF_DL_1200_720",
        v_HandleCateCode: "CR_TAB",
        v_HandleInstanceCode: "CR_TAB_shopWorker",
        title: "铺位工作台"
      };
      let graphList = this.graphList[this.graphListKey];
      //铺位图纸
      graphList.DrawingNumber = graphList["v_DrawingNumber"];
      const totalHeight = {
        BeamBottonHigh:
          graphList?.v_BeamBottonHigh_min +
          "-" +
          graphList?.v_BeamBottonHigh_max,
        PlateBottomHigh:
          graphList?.v_BeamBottonHigh_max +
          "-" +
          graphList?.v_PlateBottomHigh_max
      };
      this.compileType = false;
      this.$api
        .fetch(
          "/esmart/index.php/osmpcom/get_general_data/get_proj_floor_list",
          {
            v_ShopReferenceID: this.graphList["v_ShopReferenceID"]
          },
          {
            method: "post",
            showErrorMsg: true,
            showSuccessMsg: false
          }
        )
        .then(res => {
          this.$emit(
            "compile-drawing",
            2,
            { ...graphList, ...totalHeight, ...res[0] },
            Code
          );
        })
        .catch(err => {
          console.log(err);
        });
    },
    //编辑信息
    compileSstoreMessage(act, Code) {
      this.compileType = false;
      //act  0 不改变xy轴的位置   3 需要改变
      this.$emit(
        "compile-drawing",
        2,
        { ...act, ...this.graphList[this.graphListKey] },
        Code
      );
    },
    canvasKeydown(code) {
      if (code.code === "Space") {
        this.KeydownType = true;
        this.instrumentType = false;
        this.$emit("close-workbench", false);
      }
    },
    canvaskeyup(code) {
      if (code.code === "Space") {
        this.KeydownType = false;
        this.instrumentType = false;
        this.$emit("close-workbench", false);
      }
    },
    onkeyup(code) {
      if (code.code === "Space") {
        this.$emit("close-workbench", true);
        this.instrumentType = true;
      }
    },
    //鼠标右键
    canvascontextmenu(event) {
      event.preventDefault();
      if (this.locationTableType) {
        this.clickLocation = event;
      }
      this.StoreInformation();
    },
    //开始绘制
    startDraw() {
      this.startDrawType = !this.startDrawType;
      //清空画布颜色
      if (!this.startDrawType) this.operatingSpaceIndex = -1;
    },
    //点击
    canvasClick(e) {
      if (!this.locationTableType) {
        const p = this.getEventPosition(this.clickLocation);
        if (p && this.context.isPointInPath(p.x, p.y)) {
          const p = this.getEventPosition(e);
          Object.assign(this.graphList[this.graphListKey].title, p);
        }
        return;
      }
      clearTimeout(this.time);
      this.time = setTimeout(() => {
        this.clickLocation = e;
        //绘制
        if (this.startDrawType) {
          this.startClick === 0 && this.startClick++;
          let p = this.getEventPosition(e);
          this.reDraw(p, this.context);
        }
      }, 200);
    },
    //移入
    canvasMouseleave() {
      if (this.compileType) {
        this.compileType = false;
      }
      return "";
    },
    //移动
    canvasMove(e) {
      if (this.graphList.length < 1) {
        return;
      }
      const context = this.context;
      //不是绘制状态
      if (!this.startDrawType && !this.KeydownType) {
        this.refreshCanvas();
        this.hoverType = false;
        //不是调整大小状态
        if (!this.adjustmentType && !this.compileType) {
          for (let i = 0, length = this.graphList.length; i < length; i++) {
            const p = this.getEventPosition(e);
            this.theFirstTimeDraw(this.graphList[i], i);
            //canvas不能控制层级如果重叠绘制到最后面的会显示到最上层
            //找出鼠标放上的是哪一个店铺把该店铺放到数组里面的最后一个里面去
            if (p && context.isPointInPath(p.x, p.y)) {
              const hoverGraph = this.graphList[i];
              const graphData = this.graphData[i];
              this.graphData.splice(i, 1);
              this.graphData.push(graphData);
              this.graphList.splice(i, 1);
              this.graphList.push(hoverGraph);
              //鼠标放上效果
              this.hoverType = true;
              this.hoverGraphListKey = i;
            }
          }
        } else {
          this.hoverType = true;
        }

        //把上面新生成的数组刷新重绘让选中店铺显示在最上层
        if (this.hoverType) {
          this.refreshCanvas();
          this.graphList.forEach((ele, index) => {
            this.theFirstTimeDraw(ele, index);
            const p = this.getEventPosition(e);
            if (
              this.graphList.length - 1 === index &&
              p &&
              context.isPointInPath(p.x, p.y)
            ) {
              this.ColorFill(
                context,
                this.initConfig.hoverColor,
                this.initConfig.hoverColor
              );
            }
          });
        }
        this.$nextTick(() => {
          this.titleDraw();
        });
      }
      //如果是绘制  或者调整大小状态
      if (this.startDrawType || !this.adjustmentType) {
        return "";
      }
      //调整大小
      if (this.graphListKey !== "") {
        const p = this.getEventPosition(e);
        this.graphList[this.graphListKey].XY.map((item, key) => {
          if (this.canvasDrag[0] === key || this.canvasDrag[1] === key) {
            item = Object.assign(item, { ...p });
            return item;
          }
        });
      }
    },
    //清除刚绘制的内容
    clearDraw() {
      this.graphList.pop();
      this.refreshCanvas();
      this.anewRedraw();
    },
    //双击事件
    canvasDblclick() {
      clearTimeout(this.time);
      if (!this.startDrawType) {
        return "";
      }
      //结束绘制
      this.startDrawType = false;
      this.iSdblclick = true;
      this.operatingSpaceIndex = -1;
      this.endToDraw();
      this.seTserialNumber();
      this.proportionRestore();
      // //还原比例
      // 根据弹框编码获取弹框数据
      this.compileDrawing("add");
    },
    //抬起事件
    canvasUp() {
      if (this.startDrawType || !this.adjustmentType) {
        return "";
      }
      this.canvasDrag = [];
      this.onmousemoveType = false;
      this.refreshCanvas();
      this.anewRedraw();
      this.context.closePath();
    },
    //鼠标按下事件
    canvasDown(e) {
      //如果是在绘制状态 或者 调整大小状态 不使用按下事件
      if (this.startDrawType || !this.adjustmentType) {
        return "";
      }
      this.onmousemoveType = true;
      const context = this.context;
      const p = this.getEventPosition(e);
      const { v_ShopsCode: shopsCode } = this.graphList[this.graphListKey];
      //调整大小
      if (this.adjustmentCode === shopsCode) {
        this.graphList[this.graphListKey].XY.forEach((item, key) => {
          context.beginPath();
          context.arc(item.x, item.y, 5, 0, 2 * Math.PI);
          context.stroke();
          context.closePath();
          if (p && context.isPointInPath(p.x, p.y)) {
            this.canvasDrag.push(key);
          }
        });
      }
    },
    //标签位置调整
    async locationTable() {
      this.locationTableType = !this.locationTableType;
      this.compileType = false;
      if (this.locationTableType) {
        this.locationTableName = "标签位置调整";
        if (this.jurisdiction === "0") return;
        this.adjustmentCode = "";

        await this.proportionRestore(this.graphListKey);
        await this.compileSstoreMessage(
          { act: "3" },
          {
            v_DialogCode: "CF_DL_560_160",
            v_HandleCateCode: "CC_FM",
            title: "标签位置调整",
            v_HandleInstanceCode: "CC_FM_adjustmentTitleLlocation"
          }
        );
      } else {
        const { v_ShopsCode: shopsCode } = this.graphList[this.graphListKey];
        this.adjustmentCode = shopsCode;
        this.locationTableName = "完成标签位置调整";
      }
    },
    //调整大小
    adjustment() {
      if (this.jurisdiction === "0") return;
      this.compileType = false;
      if (this.adjustmentType) {
        this.proportionRestore(this.graphListKey);
        this.adjustmentCode = "";
        this.compileSstoreMessage(
          { act: "3" },
          {
            v_DialogCode: "CF_DL_560_160",
            v_HandleCateCode: "CC_FM",
            title: "调整大小",
            v_HandleInstanceCode: "CC_FM_drawAdjustmentSize"
          }
        );
      } else {
        //标记现在点击的铺位
        const { v_ShopsCode: shopsCode } = this.graphList[this.graphListKey];
        this.adjustmentCode = shopsCode;
        this.adjustmentName = "完成调整";
      }
      this.adjustmentType = !this.adjustmentType;
      this.iSdblclick = false;
    },

    //图片缩放
    pictureZoom() {
      //不能在绘制状态下缩放
      const config = this.config;
      this.dynamic.width = config.width * this.proportion;
      this.dynamic.height = config.height * this.proportion;
      const _obj = {
        recordDynamicTime: this.recordDynamicTime,
        progressValue: this.progressValue
      };
      //缓存图片大小配置，用于，编辑或者调整刷新后还原，
      localStorage.setItem(
        "currentPictureSizeConfiguration",
        JSON.stringify(_obj)
      );
      this.$nextTick(() => {
        this.refreshCanvas();
        this.anewRedraw();
      });
    },
    //图片减少
    pictureReduce() {
      if (this.progressValue < 1) {
        this.message++;
        this.message < 2 &&
          this.$message({
            message: "已经是最小了",
            type: "warning"
          });
        return "";
      }
      if (!this.startDrawType) {
        this.progressValue -= 3;
        this.progressValue < 30
          ? (this.recordDynamicTime += 1)
          : (this.recordDynamicTime += 5);
        this.pictureZoom();
      } else {
        this.message++;
        this.message < 2 &&
          this.$message({
            message: "正在绘制不能进行缩放",
            type: "warning"
          });
        return;
      }
      this.message = 0;
    },
    //图片增加
    pictureAdd() {
      if (this.progressValue > this.progressValueMax) {
        this.message++;
        this.message < 2 &&
          this.$message({
            message: "已经是最大了",
            type: "warning"
          });
        return;
      }
      if (!this.startDrawType) {
        this.progressValue += 3;
        this.progressValue <= 30
          ? (this.recordDynamicTime -= 1)
          : (this.recordDynamicTime -= 5);
        this.pictureZoom();
      } else {
        this.message++;
        this.message < 2 &&
          this.$message({
            message: "正在绘制不能进行缩放",
            type: "warning"
          });
        return;
      }
      this.message = 0;
    },
    //标签位置
    titleLocatio(item) {
      let x = item.map(ele => {
        return ele.x;
      });
      let y = item.map(ele => {
        return ele.y;
      });
      x = [...new Set(x.sort(this.sortNum))];
      y = [...new Set(y.sort(this.sortNum))];
      return {
        x: (x[x.length - 1] - x[0]) / 2 + x[0],
        y: (y[y.length - 1] - y[0]) / 2 + y[0]
      };
    },
    //排序
    sortNum(a, b) {
      return a - b;
    },
    //比例还原
    proportionRestore(key) {
      //把缩小的比例在按比例还原给回  确定组件图形不会变小
      const newGraphList = JSON.parse(JSON.stringify(this.graphList));
      newGraphList.map(item => {
        if (item?.XY) {
          const { x, y } = item.title;
          item.title = Object.assign(item.title, {
            x: parseInt(x) * this.newProportion,
            y: parseInt(y) * this.newProportion
          });
          item.XY = item.XY.map(ele => {
            return {
              x: ele.x * this.newProportion,
              y: ele.y * this.newProportion
            };
          });
          return item;
        }
      });
      this.$emit("change", newGraphList, key);
    },
    // 设置宽高
    dynamicSize() {
      //当前图片的大小配置
      const currentPictureSize = localStorage.getItem(
        "currentPictureSizeConfiguration"
      );
      //如果 上传的宽高 小于  canva 宽高 直接输出宽高
      if (this.$refs.canvasBox && !currentPictureSize) {
        if (
          this.dynamic.width < this.$refs.canvasBox.clientWidth &&
          this.dynamic.height < this.$refs.canvasBox.clientHeight
        ) {
          //比例缩放  放到中间
          this.progressValue = 30;
          this.recordDynamicTime = this.dynamicTime;
          this.dynamicTime = 0;
          //如果图片太大缩放比放入进来的不会很精确再次修正
          this.pictureReduce();
          this.pictureAdd();
        } else {
          //如果宽高不合适，那么归递直到大小合适
          const { width, height } = this.config;
          let size = this.dynamicTime / this.resizePercentage;
          this.dynamicTime++;
          this.dynamic = {
            width: width - width * size,
            height: height - height * size
          };
          this.dynamicSize();
        }
      } else {
        //如果有缓存的图片大小配置，，那么直接配置图片大小
        const { recordDynamicTime, progressValue } = JSON.parse(
          currentPictureSize
        );
        this.recordDynamicTime = recordDynamicTime;
        this.progressValue = progressValue;
        this.pictureZoom();
      }
    },
    //下面左侧操作栏点击事件
    operatingSpaceClick(id, index) {
      this.operatingSpaceIndex = index;
      switch (id) {
        case "1":
          //编辑图纸
          this.compileDrawing("edit");
          break;
        case "3":
          //开始绘制
          this.startDraw(index);
          break;
        default:
          "";
      }
    },
    drawingAdministration() {},
    //右侧编辑
    compileDrawing(titie) {
      this.$refs.canvasDialog.dialogFormVisible = true;
      titie === "add" ? (this.dialogName = "添加") : (this.dialogName = "编辑");
    },
    //设置编号
    seTserialNumber() {
      let graphList;
      if (this.iSdblclick) {
        graphList = this.graphList[this.graphList.length - 1];
      } else {
        graphList = this.graphList[this.graphListKey];
      }
      this.adjustmentName = "调整大小";
      const p = this.titleLocatio(graphList.XY);
      graphList.title = Object.assign(graphList.title, p);
    },
    //刷新canvas //清空画布（宽高改变自动清除）
    refreshCanvas() {
      this.canvas.height = this.canvas.height + 1;
      this.canvas.height = this.canvas.height - 1;
    },
    //删除店铺
    deleteStore() {
      if (this.jurisdiction === "0") return;
      this.$emit("delete-store", this.graphList[this.hoverGraphListKey]);
      this.compileType = false;
    },
    //颜色填充
    ColorFill(context, strokeColor, fillColor) {
      const style = {
        strokeStyle: strokeColor,
        fillStyle: fillColor
      };
      context = Object.assign(context, style);
      context.fill(); //填充
      context.stroke(); //描边
      context.closePath(); //结束绘制
    },
    //绘制草图，，存储位置信息
    reDraw(p, context) {
      this.graph.push(p);
      const style = {
        strokeStyle: this.initConfig.drawClickColor,
        lineWidth: this.initConfig.lineWidth
      };
      context = Object.assign(context, style);
      if (this.startClick === 1) {
        context.beginPath();
        context.moveTo(p.x, p.y);
        this.startClick++;
      } else {
        context.lineTo(p.x, p.y);
        context.stroke();
      }
      //圆
      this.drawCircleInit(context, p.x, p.y, 2);
    },
    //xy轴坐标
    getEventPosition(ev) {
      let x, y;
      if (ev.layerX || ev.layerX == 0) {
        x = ev.layerX;
        y = ev.layerY;
      } else if (ev.offsetX || ev.offsetX == 0) {
        x = ev.offsetX;
        y = ev.offsetY;
      }
      return { x: x, y: y };
    },
    //是否在店铺中点击
    storeClick() {
      this.refreshCanvas();
      let num = 0;
      this.graphList.forEach((ele, key) => {
        this.theFirstTimeDraw(ele, key);
        this.compileType = false;
        const p = this.getEventPosition(this.clickLocation);
        if (p && this.context.isPointInPath(p.x, p.y)) {
          this.graphListKey = key;
          //如果选择了调整大小，那么右键点击只能在同一个铺位才能点击完成调整
          if (
            !this.adjustmentCode ||
            (this.adjustmentCode &&
              this.graphList[this.graphListKey]?.v_ShopsCode ===
                this.adjustmentCode)
          ) {
            num++;
            this.compileType = true;
          }
        }
      });
      this.titleDraw();
      num > 0 ? (this.compileType = true) : (this.compileType = false);
    },
    //店铺信息
    StoreInformation() {
      this.StoreInformationType = true;
      this.storeClick();
      const p = this.getEventPosition(this.clickLocation);
      const left = this.$refs.mycanvas.getBoundingClientRect().left;
      const top = this.$refs.mycanvas.getBoundingClientRect().top;
      this.X = parseInt(p.x) + left + 60 + "px";
      this.Y = parseInt(p.y) + top - 40 + "px";
    },
    //结束绘制
    endToDraw() {
      if (!this.startDrawType) {
        //把第一个点的位置同样设置为最后一个位置
        const obj = this.graph[0];
        this.graph.push(obj);
        this.refreshCanvas();
      }
      const length = this.graphList.length;
      //重新绘制   如果有绘制那么把绘制的坐标 记录
      if (this.graph) {
        const obj = {
          XY: [],
          title: {
            x: "",
            y: ""
          }
        };
        this.graphList[length] = obj;
        this.graphList[length].XY = this.graph;
      }
      this.anewRedraw();
      //清空草图的信息
      this.startClick = 0;
      this.graph = [];
    },
    //重新绘制
    anewRedraw() {
      this.graphList.forEach((ele, key) => {
        this.theFirstTimeDraw(ele, key);
      });
      //绘制店铺编号   必须要绘制完图形后在绘制不然会被铺盖
      this.titleDraw();
    },
    //标题绘制
    titleDraw() {
      let context = this.context;
      const { color } = this.initConfig.titleStyle;
      const obj = {
        fillStyle: color,
        fontFamily: "MicrosoftYaHei, Microsoft YaHei"
      };
      context = Object.assign(context, obj);
      this.graphList.forEach((item, index) => {
        const title = item.title;
        context.textAlign = "left";
        context.font = "8px Arial";
        context.restore();
        const graphList = this.graphList;
        if (graphList[index]) {
          const { v_ShopStatus: shopStatus, institutionsName } = graphList[
            index
          ];
          context.fillText(
            graphList[index]["v_ShopsCode"] || "",
            title.x - 10,
            title.y - 10
          );
          if (shopStatus === "40") {
            context.fillText(
              institutionsName ? institutionsName : "",
              title.x - 10,
              title.y
            );
          }
          context.fillText(
            graphList[index]["v_FloorSquare"]
              ? "建面 : " + graphList[index]["v_FloorSquare"] + "㎡"
              : "",
            title.x - 10,
            shopStatus === "40" ? title.y + 20 : title.y + 10
          );
          context.fillText(
            graphList[index]["v_UsingSquare"]
              ? "实面 : " + graphList[index]["v_UsingSquare"] + "㎡"
              : "",
            title.x - 10,
            shopStatus === "40" ? title.y + 10 : title.y
          );
        }
        context.restore();
      });
    },
    //绘制圆形
    drawCircleInit(context, x, y, radius) {
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.stroke();
      context.closePath();
    },
    //绘制封装
    theFirstTimeDraw(ele, key) {
      const context = this.context;
      if (ele?.XY) {
        ele.XY.forEach((item, index) => {
          if (index === 0) {
            context.beginPath();
            context.moveTo(item.x, item.y);
          }
          context.lineTo(item.x, item.y);
        });
      }
      if (this.graphList[key]?.v_ShopStatus) {
        const { v_ShopStatus: shopStatus } = this.graphList[key];
        const {
          beingDecoratedColor,
          transparency,
          fillStyle,
          rentOutStroke
        } = this.initConfig;
        //控制铺位颜色
        if (shopStatus) {
          if (shopStatus === "10") {
            //待租
            this.ColorFill(context, beingDecoratedColor, transparency);
          } else if (parseInt(shopStatus) >= 20 && parseInt(shopStatus) <= 30) {
            this.ColorFill(context, beingDecoratedColor, fillStyle);
          } else if (shopStatus === "40") {
            this.ColorFill(context, beingDecoratedColor, rentOutStroke);
          }
        }
      }
    },
    canvasInit() {
      if (!this.canvas && this.$refs) {
        const cvs = this.$refs.mycanvas;
        const context = cvs.getContext("2d");
        this.context = context;
        this.canvas = cvs;
      }
      this.anewRedraw();
    },

    //窗口大小
    resize() {
      setTimeout(() => {
        this.dynamic = Object.assign(this.dynamic, this.config);
        this.dynamicSize();
        this.canvasInit();
        setTimeout(() => {
          this.isgraphListNull();
        });
      }, 200);
    },
    //如果没有一个图形
    isgraphListNull() {
      this.graphList.length < 1 && this.drawCircleInit(this.context, 0, 0, 0);
    },
    //判断滚动方向
    handleScroll(e) {
      if (this.KeydownType) {
        let direction = e.deltaY > 0 ? "up" : "down";
        if (direction === "up") {
          //缩小
          this.pictureReduce();
          this.keydownNum--;
          //对定位进行效验
          const canvasBoxWidth = this.$refs.canvasBox.offsetWidth;
          const canvasBoxHeight = this.$refs.canvasBox.offsetHeight;
          const mycanvasWidth = this.$refs.mycanvas.offsetWidth;
          const mycanvasHeight = this.$refs.mycanvas.offsetHeight;
          if (canvasBoxWidth >= mycanvasWidth) {
            this.$refs.mycanvas.style.left =
              (canvasBoxWidth - mycanvasWidth) / 2 + "px";
          } else if (canvasBoxWidth <= mycanvasWidth) {
            this.$refs.mycanvas.style.left =
              -((mycanvasWidth - canvasBoxWidth) / 2) + "px";
          }
          if (canvasBoxHeight >= mycanvasHeight) {
            this.$refs.mycanvas.style.top =
              (canvasBoxHeight - mycanvasHeight) / 2 + "px";
          } else if (canvasBoxHeight <= mycanvasHeight) {
            this.$refs.mycanvas.style.top =
              (canvasBoxHeight - mycanvasHeight) / 2 + "px";
          }
        } else {
          //增加
          this.pictureAdd();
          this.keydownNum++;
        }
      }
    }
  },
  mounted() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.canvasKeydown);
    window.addEventListener("keyup", this.canvaskeyup);
    window.addEventListener("mousewheel", this.handleScroll);
    window.addEventListener("keyup", this.onkeyup);
    this.resize();
  },
  destroyed() {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.canvasKeydown);
    window.removeEventListener("keyup", this.canvaskeyup);
    window.removeEventListener("mousewheel", this.handleScroll);
    window.removeEventListener("keyup", this.onkeyup);
  },
  directives: {
    //设置拖拽指令
    drag: {
      // 指令的定义
      update: function(el, binding) {
        const odiv = el; //获取当前元素
        // 对移动做限制
        const parentNodeWidth = odiv.parentNode.offsetWidth / 1.5;
        const parentNodeHeight = odiv.parentNode.offsetHeight / 1.5;
        const odivWidth = -odiv.offsetWidth / 1.5;
        const odivHeight = -odiv.offsetHeight / 1.5;
        odiv.onmousedown = e => {
          if (binding.value) {
            //算出鼠标相对元素的位置
            let disX = e.clientX - odiv.offsetLeft;
            let disY = e.clientY - odiv.offsetTop;
            document.onmousemove = e => {
              //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
              let left = e.clientX - disX;
              let top = e.clientY - disY;
              //离左边的距离
              if (left <= odivWidth) {
                left = odivWidth;
              } else if (left >= parentNodeWidth) {
                left = parentNodeWidth;
              }
              //离的距离
              if (top <= odivHeight) {
                top = odivHeight;
              } else if (top >= parentNodeHeight) {
                top = parentNodeHeight;
              }
              //移动当前元素
              odiv.style.left = left + "px";
              odiv.style.top = top + "px";
            };
            document.onmouseup = () => {
              document.onmousemove = null;
              document.onmouseup = null;
              document.onmousedown = null;
            };
          }
        };
      }
    }
  }
};
</script>
<style lang="scss" src="./index.scss"></style>
