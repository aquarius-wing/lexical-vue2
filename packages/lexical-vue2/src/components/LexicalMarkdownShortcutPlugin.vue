<script>
import { TRANSFORMERS, registerMarkdownShortcuts } from '@lexical/markdown'
import { useEditor, useMounted } from '../composables'

export default {
  props: {
    transformers: {
      type: Array,
      default: () => [...TRANSFORMERS]
    }
  },
  setup(props) {
    const editor = useEditor()

    useMounted(() => {
      registerMarkdownShortcuts(editor, props.transformers)
    })

    return {}
  }
}
</script>

<template/>