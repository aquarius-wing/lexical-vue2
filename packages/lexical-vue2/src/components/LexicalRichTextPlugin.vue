<script>
import { useCanShowPlaceholder, useRichTextSetup } from '../composables'
import { inject } from "@vue/composition-api";
import Decorators from './LexicalDecoratedTeleports'


export default {
  setup() {
    const editor = inject('editor')
    useRichTextSetup(editor)
    const showPlaceholder = useCanShowPlaceholder(editor)
    return {
      showPlaceholder
    }
  },
  components: {
    Decorators
  }
}
</script>

<template>
  <div>
    <slot v-if="showPlaceholder" name="placeholder"/>
    <slot name="contentEditable"/>
    <Decorators />
  </div>
</template>

<style>

</style>
