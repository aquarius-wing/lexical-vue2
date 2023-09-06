<script>
import {useList} from "@/composables/useList";
import {useEditor} from "@/composables";

export default {
  setup() {
    const editor = useEditor()
    useList(editor)
  }
}
</script>

<template>
</template>

<style>

</style>