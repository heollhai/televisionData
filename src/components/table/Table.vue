<template>
  <div>
    <search-form
      :formLabel="formLabel"
      @search="search"
      :tableData="tableData"
    ></search-form>
    <div class="report-table">
      <el-table ref="elTable" border :data="tableData">
        <el-table-column
          :resizable="false"
          v-for="item in colTitle"
          :show-overflow-tooltip="true"
          :fixed="item.fixed"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import exportExcel from "@/util/exportExcel.js";
import { initFormLabel } from "@/util/publicData";
import searchForm from "@/components/form/Form.vue";
export default {
  components: { searchForm },
  name: "specialView",
  props: {
    colTitle: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    lineLength: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      //搜索表单
      formLabel: initFormLabel
    };
  },
  methods: {
    search(val) {
      this.$emit("search", val);
    },
    //导出
    exportEvent() {
      const dom = document.querySelector(".el-table__body-wrapper");
      exportExcel(dom, this.lineLength, this.tableData.length, "task_list");
    }
  }
};
</script>
<style lang="scss" src="./index.scss" scoped></style>
