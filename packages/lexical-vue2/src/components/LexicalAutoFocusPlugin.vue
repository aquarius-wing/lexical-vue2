<script>
import {nextTick, onMounted} from '@vue/composition-api';
import { useEditor } from '../composables';

export default {
  props: {
    defaultSelection: {
      type: String,
      default: 'rootStart'
    }
  },
  setup(props) {
    const editor = useEditor();

    onMounted(() => {
      nextTick(() => {
        editor.focus(() => {
          const activeElement = document.activeElement;
          const rootElement = editor.getRootElement();

          if (
            rootElement !== null &&
            (!activeElement || !rootElement.contains(activeElement))
          ) {
            rootElement.focus({ preventScroll: true });
          }
        }, {
          defaultSelection: props.defaultSelection
        });
      });
    });
  }
}
</script>

<template>
</template>