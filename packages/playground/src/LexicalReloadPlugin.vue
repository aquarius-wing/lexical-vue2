<script>
import {EMOJI, useEditor, DIVIDER} from "lexical-vue2";
import {onMounted} from "@vue/composition-api";
import emitter, {MARKDOWN_CHANGED_COMMAND} from "@/emitter";
import {$convertFromMarkdownString, TRANSFORMERS} from "@lexical/markdown";

export default {
  setup() {
    const editor = useEditor()
    onMounted(() => {
      emitter.on(MARKDOWN_CHANGED_COMMAND, (md) => {
        const initialEditorState = () => $convertFromMarkdownString(md, [EMOJI, DIVIDER, ...TRANSFORMERS])
        console.log("md", md);
        editor.update(() => {
              initialEditorState(editor)
        }, {
          tags: 'reload'
        })
      })
    })
  }
}
</script>

<template>
  <div></div>
</template>

<style>

</style>