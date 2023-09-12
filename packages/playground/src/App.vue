<template>
  <div id="app">
    <h1>Lexical Vue2 Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <LexicalEditor ref="editorDOM"/>
    <div class="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
              href="https://github.com/tatfook/lexical-vue2"
              target="_blank"
              rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </div>
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
