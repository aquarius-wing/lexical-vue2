<template>
  <div id="app">
    <h1>Lexical Vue2 Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <div class="two-editor-container">
      <LexicalEditor ref="editorDOM" style="width: 50%;overflow-y: auto;"/>
      <div class="markdown-editor" contenteditable="true" ref="MARKDOWN_EDITOR_REF">
        <p v-for="(md, index) in ExampleMd.split('\n')" :key="index">
          <span v-if="md !== ''">{{ md }}</span>
          <br v-else/>
        </p>
      </div>
    </div>

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
import ExampleMd from './assets/example.md'
import {onMounted, ref} from "@vue/composition-api";
import emitter, {MARKDOWN_CHANGED_COMMAND} from "@/emitter";

export default {
  name: 'App',
  components: {LexicalEditor},
  setup() {
    const MARKDOWN_EDITOR_REF = ref()
    onMounted(() => {
      MARKDOWN_EDITOR_REF.value.addEventListener('input', () => {
        console.log("MARKDOWN_EDITOR_REF.value.innerText", MARKDOWN_EDITOR_REF.value.innerText);
        emitter.emit(MARKDOWN_CHANGED_COMMAND, MARKDOWN_EDITOR_REF.value.innerText)
      })
    })
    return {
      ExampleMd,
      MARKDOWN_EDITOR_REF
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.two-editor-container{
  margin: 0 auto;
  width: 80%;
  display: flex;
  height: 1000px;
}
.markdown-editor{
  overflow-y: auto;
  width: 50%;
  background: #FFF;
  border-left: 1px solid #cccccc;
  text-align: left;
  padding: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  &:focus{
    outline: none;
  }
  p{
    margin: 0 0 10px;
  }
}
</style>
