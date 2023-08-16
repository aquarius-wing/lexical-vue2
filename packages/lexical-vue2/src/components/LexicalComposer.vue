<script>
import {$createParagraphNode, $getRoot, $getSelection, createEditor} from "lexical";
import {onMounted} from "@vue/composition-api";
export default {
  provide(){
    return {
      editor: this.editor
    }
  },
  setup(props, {emit}) {
    const HISTORY_MERGE_OPTIONS = {tag: 'history-merge'}
    function initializeEditor(editor, initialEditorState) {
      if (initialEditorState === null) {
        return
      }

      if (initialEditorState === undefined) {
        editor.update(() => {
          const root = $getRoot()
          if (root.isEmpty()) {
            const paragraph = $createParagraphNode()
            root.append(paragraph)
            const activeElement = document.activeElement
            if (
                $getSelection() !== null
                || (activeElement !== null && activeElement === editor.getRootElement())
            )
              paragraph.select()
          }
        }, HISTORY_MERGE_OPTIONS)
      } else if (props.initialConfig.initialEditorState !== null) {
        switch (typeof initialEditorState) {
          case 'string': {
            const parsedEditorState = editor.parseEditorState(initialEditorState)
            editor.setEditorState(parsedEditorState, HISTORY_MERGE_OPTIONS)
            break
          }
          case 'object': {
            editor.setEditorState(initialEditorState, HISTORY_MERGE_OPTIONS)
            break
          }
          case 'function': {
            editor.update(() => {
              const root = $getRoot()
              if (root.isEmpty())
                initialEditorState(editor)
            }, HISTORY_MERGE_OPTIONS)
            break
          }
        }
      }
    }
    const editor = createEditor({
      editable: props.initialConfig.editable,
      namespace: props.initialConfig.namespace,
      nodes: props.initialConfig.nodes,
      theme: props.initialConfig.theme,
      onError(error) {
        emit('error', error)
      },
    })
    initializeEditor(editor, props.initialConfig.editorState)

    onMounted(() => {
      const isEditable = props.initialConfig.editable
      editor.setEditable(isEditable || false)
    })
    return {
      editor
    }
  },
  props: {
    initialConfig: {
      namespace: '',
      nodes: [],
      editable: true,
      editorState: undefined
    }
  },
}
</script>

<template>
  <div>
    <slot/>
  </div>
</template>

<style>

</style>
