// excel表头
const letterList = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];
const initFormLabel = [
  {
    label: "大小",
    model: "size",
    type: "select",
    options: []
  },
  {
    label: "型号",
    model: "type",
    type: "select",
    options: []
  },
  {
    label: "品牌",
    model: "brand",
    type: "select",
    options: []
  }
];
const size = [
  {
    value: "size1",
    label: "大小1"
  },
  {
    value: "size2",
    label: "大小2"
  }
];
const type = [
  {
    parent: "size1",
    value: "task_type1",
    label: "型号1"
  },
  {
    parent: "size2",
    value: "task_type2",
    label: "型号1_2"
  }
];
export { letterList, initFormLabel, size, type };
