<template>
  <el-form ref="searchForm" :inline="true" :model="formModel" @search="search">
    <el-form-item
      v-for="item in newformLabel"
      :key="item.model"
      :label="item.label"
    >
      <el-input v-model="formModel[item.model]" v-if="!item.type"></el-input>
      <el-select
        v-if="item.type === 'select'"
        filterable
        v-model="formModel[item.model]"
        @change="change(item, formModel[item.model])"
      >
        <el-option
          v-for="item in item.options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item class="inquire-button" v-if="searchButton">
      <el-button class="search" size="small" @click="search">查询</el-button>
      <el-button @click="reset" size="small">重置</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { size, type } from "@/util/publicData";
export default {
  name: "searchForm",
  props: {
    formLabel: Array,
    searchButton: {
      type: Boolean,
      default: true
    },
    tableData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newformLabel: JSON.parse(JSON.stringify(this.formLabel)),
      formModel: {}
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      //初始化
      this.newformLabel.forEach(item => {
        this.$set(this.formModel, item.model, "");
        if (item.model === "size") {
          item.options = size;
        }
      });
    },
    change(row, val) {
      const { model } = row;
      this.newformLabel.forEach(item => {
        //型号
        if (model === "size" && item.model === "type") {
          item.options = type.filter(item => item.parent === val);
        }
      });
    },
    //查询
    search() {
      this.$emit("search", this.formModel);
    },
    //重置
    reset() {
      this.newformLabel.forEach(item => {
        this.$set(this.formModel, item.model, "");
      });
    }
    // //表单保存
    // save() {
    //   this.$emit('edit-tableData')
    // }
  }
};
</script>
<style scoped lang="scss" src="./index.scss"></style>
