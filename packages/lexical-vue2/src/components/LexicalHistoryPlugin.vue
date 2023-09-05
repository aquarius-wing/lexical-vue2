<script>
import {useHistory} from "../composables/useHistory";
import {useEditor} from "../composables";

export default {
  setup(props) {
    const editor = useEditor()
    useHistory(editor, props.externalHistoryState)
  }
}
</script>

<template>
</template>

<style>

</style>