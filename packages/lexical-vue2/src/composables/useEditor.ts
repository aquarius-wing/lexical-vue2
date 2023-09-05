import { inject } from '@vue/composition-api'
import {LexicalEditor} from "lexical";

export function useEditor(): LexicalEditor {
  const editor = inject('editor')

  if (!editor)
    throw new Error('<LexicalComposer /> is required')

  return editor as LexicalEditor
}
