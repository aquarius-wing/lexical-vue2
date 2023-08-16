<script>
import { ref, onMounted } from '@vue/composition-api'
import { useEditor, useAutoLink } from '../composables'

export default {
  props: {
    matchers: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const editor = useEditor()

    onMounted(() => {
      useAutoLink(
        editor,
        props.matchers,
        (url, prevUrl) => {
          emit('change', {
            url,
            prevUrl
          })
        }
      )
    })

    return {}
  }
}
</script>

<template></template>