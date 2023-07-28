import { readonly, ref } from '@vue/composition-api';
import { $canShowPlaceholderCurry } from '@lexical/text';
import { mergeRegister } from '@lexical/utils';
import { useMounted } from './useMounted';
function canShowPlaceholderFromCurrentEditorState(editor) {
  const currentCanShowPlaceholder = editor
      .getEditorState()
      .read($canShowPlaceholderCurry(editor.isComposing()));
  return currentCanShowPlaceholder;
}
export function useCanShowPlaceholder(editor) {
  const initialState = editor
      .getEditorState()
      .read($canShowPlaceholderCurry(editor.isComposing()));
  const canShowPlaceholder = ref(initialState);
  function resetCanShowPlaceholder() {
    const currentCanShowPlaceholder = canShowPlaceholderFromCurrentEditorState(editor);
    canShowPlaceholder.value = currentCanShowPlaceholder;
  }
  useMounted(() => {
    return mergeRegister(editor.registerUpdateListener(() => {
      resetCanShowPlaceholder();
    }), editor.registerEditableListener(() => {
      resetCanShowPlaceholder();
    }));
  });
  return readonly(canShowPlaceholder);
}
