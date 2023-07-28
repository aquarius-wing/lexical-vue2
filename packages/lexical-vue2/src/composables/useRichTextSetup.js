import { registerDragonSupport } from '@lexical/dragon'
import { registerRichText } from '@lexical/rich-text'
import { mergeRegister } from '@lexical/utils'
import { useMounted } from './useMounted'

export function useRichTextSetup(editor) {
  useMounted(() => {
    return mergeRegister(
      registerRichText(editor),
      registerDragonSupport(editor),
    )
  })
}
