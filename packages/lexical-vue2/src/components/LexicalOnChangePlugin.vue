<script>
import {useEditor, useMounted} from "../composables";
import {$getRoot} from "lexical";

export default {
  /**
   * const props = withDefaults(defineProps<{
   *   ignoreInitialChange?: boolean
   *   ignoreSelectionChange?: boolean
   *   modelValue?: string
   * }>(), {
   *   ignoreInitialChange: true,
   *   ignoreSelectionChange: false,
   * })
   */
  props: {
    ignoreInitialChange: {
      type: Boolean,
      default: true
    },
    ignoreSelectionChange: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  setup(props, {emit}) {
    const editor = useEditor()
    useMounted(() => {
      editor.registerUpdateListener(({editorState, dirtyElements, dirtyLeaves, prevEditorState, tags}) => {
        if (props.ignoreSelectionChange && dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return
        }
        if (props.ignoreInitialChange && prevEditorState.isEmpty()) {
          return
        }
        emit('change', editorState, editor)
        editorState.read(() => {
          emit('update:modelValue', $getRoot().getTextContent())
        })
      })
    })
  }
}
</script>

<template>
</template>

<style>

</style>