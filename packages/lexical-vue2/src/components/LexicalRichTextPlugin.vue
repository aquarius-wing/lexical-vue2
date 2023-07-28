<script>
import { useCanShowPlaceholder, useRichTextSetup } from '../composables'
import { inject } from "@vue/composition-api";

export default {
  setup() {
    const editor = inject('editor')
    useRichTextSetup(editor)
    const showPlaceholder = useCanShowPlaceholder(editor)
    return {
      showPlaceholder
    }
  },
}
</script>

<template>
  <div>
    <slot v-if="showPlaceholder" name="placeholder"/>
    <slot name="contentEditable"/>
  </div>
</template>

<style>

</style>
