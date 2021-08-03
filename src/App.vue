<template>
  <div id="app">
    <three-model v-if="type === 1"></three-model>
    <!--<tree-model></tree-model>-->
    <!--<click-highlight></click-highlight>-->
    <show-tip v-if="type === 2"></show-tip>
    <!--<div class="btn-box">-->
      <!--<button @click="showModel(1)">模型1</button>-->
      <!--<button @click="showModel(2)">模型2</button>-->
    <!--</div>-->
  </div>
</template>

<script>
  import ThreeModel from '@/components/threeModel'
  import TreeModel from '@/components/TreeModel'
  import ClickHighlight from '@/components/clickHighlight'
  import ShowTip from '@/components/showTip'
export default {
  name: 'App',
  components: {
    ThreeModel,
    TreeModel,
    ClickHighlight,
    ShowTip
  },
  data() {
    return {
      type: 2
    }
  },
  methods: {
    showModel(type) {
      this.type = type;
    }
  }

}
</script>

<style>
  #app{

  }
  .btn-box{
    position: absolute;
    top: 50px;
    right: 50px;
  }
</style>
