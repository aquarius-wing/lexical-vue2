import { registerDragonSupport } from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import { useMounted } from './useMounted'
import { LexicalEditor } from "lexical";

export function useRichTextSetup(editor: LexicalEditor) {
  useMounted(() => {
    return mergeRegister(
      registerRichText(editor),
      registerDragonSupport(editor),
    )
  })
}
