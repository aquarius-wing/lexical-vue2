<script>
import {useDecorators, useEditor} from "../composables";

export default {
  setup() {
    const editor = useEditor()
    console.log('editor useEditor1', editor);
    const decorators = useDecorators(editor)
    console.log('decorators', decorators);
    return () => decorators.value
  }
}
</script>

<template>
  <div></div>
</template>

<style>

</style>