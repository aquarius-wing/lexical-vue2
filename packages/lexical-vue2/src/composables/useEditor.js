import { inject } from '@vue/composition-api'

export function useEditor() {
  const editor = inject('editor')

  if (!editor)
    throw new Error('<LexicalComposer /> is required')

  return editor
}
