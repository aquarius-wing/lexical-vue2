<script>
import {LexicalComposer, LexicalRichTextPlugin, LexicalContentEditable} from 'lexical-vue2'
export default {
  setup() {
    return {
    }
  },
  components: {
    LexicalComposer,
    LexicalRichTextPlugin,
    LexicalContentEditable
  },
}
</script>

<template>
  <LexicalComposer :initialConfig="{editable: true}">
    <div class="editor-container">
      <div class="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input"/>
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
      </div>
    </div>
  </LexicalComposer>
</template>

<style>

</style>
