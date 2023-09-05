import {readonly, ref} from '@vue/composition-api';
import {$canShowPlaceholderCurry} from '@lexical/text';
import {mergeRegister} from '@lexical/utils';
import {useMounted} from './useMounted';
import {LexicalEditor} from "lexical";

function canShowPlaceholderFromCurrentEditorState(
  editor: LexicalEditor,
): boolean {
  return editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))
}

export function useCanShowPlaceholder(editor: LexicalEditor) {
  const initialState = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()))

  const canShowPlaceholder = ref(initialState)

  function resetCanShowPlaceholder() {
    canShowPlaceholder.value = canShowPlaceholderFromCurrentEditorState(editor)
  }

  useMounted(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        resetCanShowPlaceholder()
      }),
      editor.registerEditableListener(() => {
        resetCanShowPlaceholder()
      }),
    )
  })

  return readonly(canShowPlaceholder)
}
