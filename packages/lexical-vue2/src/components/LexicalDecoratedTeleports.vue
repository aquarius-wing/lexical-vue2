<script>
import {useDecorators, useEditor} from "../composables";

export default {
  setup() {
    const editor = useEditor()
    const decorators = useDecorators(editor)
    return () => decorators.value
  }
}
</script>

<template>
  <div></div>
</template>

<style>

</style>