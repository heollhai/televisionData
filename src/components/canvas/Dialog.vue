<!--  -->
<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible">
    <add-form
      :formLabel="formLabel"
      :searchButton="false"
      @search="save"
      ref="addForm"
    ></add-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AddForm from "@/components/form/Form.vue";
export default {
  components: { AddForm },
  props: {
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      dialogFormVisible: false,
      formLabel: [
        {
          label: "大小",
          model: "size"
        }
      ]
    };
  },
  created() {},
  methods: {
    save(val) {
      this.$emit("save", { val: val, title: this.title });
    },
    //确定
    confirm() {
      this.$refs.addForm.search();
    }
  }
};
</script>
<style lang="scss" scoped></style>
