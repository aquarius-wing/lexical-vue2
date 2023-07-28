<template>
  <div id="app">
    <LexicalEditor/>
  </div>
</template>

<script>
import LexicalEditor from "@/LexicalEditor.vue";

export default {
  name: 'App',
  components: {LexicalEditor},
  setup() {
    return {
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
