import {useEditor} from "@/composables/useEditor";
import {onMounted, onUnmounted, ref, watch} from "@vue/composition-api";
import {useMounted} from "@/composables/useMounted";
import {
  $createParagraphNode, $getNodeByKey, $getRoot,
  $getSelection, $isElementNode,
  $isRangeSelection, DELETE_CHARACTER_COMMAND, DELETE_LINE_COMMAND, DELETE_WORD_COMMAND,
  ElementNode, INSERT_PARAGRAPH_COMMAND,
  LexicalEditor, MOVE_TO_END,
  RangeSelection
} from "lexical";
import {$wrapNodes} from "@/lexical-util";
import {$createHeadingNode, $createQuoteNode} from "@lexical/rich-text";
import {$isListNode, insertList} from "@lexical/list";
import {$createCodeNode} from "@lexical/code";
import {mergeRegister} from "@lexical/utils";

export interface BlockFormat {
  key: string
  wordsToSearch: string[]
  wordsToShow?: string
  name: string
  className?: string
  transform: (editor: LexicalEditor, selection: RangeSelection) => void
}

export function useSlashMenuPlugin(props) {
  const editor = useEditor()
  const rootContainer = ref<HTMLElement>()

  interface Data {
    isShow: boolean
    top: number
    left: number
    selectedElementKey?: string
  }

  const data = ref<Data>({
    isShow: false,
    top: 0,
    left: 0,
  })
  const dropdownMenu = ref<HTMLElement | undefined>()
  let unregister: () => void

  const defaultBlockFormats: BlockFormat[] = [
    {
      key: 'Paragraph',
      wordsToSearch: ['段落', 'duanluo', 'dl'],
      name: 'Paragraph',
      className: 'format_paragraph',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createParagraphNode()
      }),
    },
    {
      key: 'Heading 1',
      wordsToSearch: ['一级标题', 'yijibiaoti', 'yjbt'],
      name: 'Heading 1',
      className: 'format_heading1',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h1')
      }),
    },
    {
      key: 'Heading 2',
      wordsToSearch: ['二级标题', 'erjibiaoti', 'ejbt'],
      name: 'Heading 2',
      className: 'format_heading2',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h2')
      }),
    },
    {
      key: 'Heading 3',
      wordsToSearch: ['三级标题', 'sanjibiaoti', 'sjbt'],
      name: 'Heading 3',
      className: 'format_heading3',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h3')
      }),
    },
    {
      key: 'Heading 4',
      wordsToSearch: ['四级标题', 'sijibiaoti', 'sjbt'],
      name: 'Heading 4',
      className: 'format_heading4',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h4')
      }),
    },
    {
      key: 'Heading 5',
      wordsToSearch: ['五级标题', 'wujibiaoti', 'wjbt'],
      name: 'Heading 5',
      className: 'format_heading5',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h5')
      }),
    },
    {
      key: 'Heading 6',
      wordsToSearch: ['六级标题', 'liujibiaoti', 'ljbt'],
      name: 'Heading 6',
      className: 'format_heading6',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createHeadingNode('h6')
      }),
    },
    {
      key: 'Quote',
      wordsToSearch: ['引用文本', 'yinyongwenben', 'yywb'],
      name: 'Quote',
      className: 'format_quote',
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, () => {
        return $createQuoteNode()
      }),
    },
    {
      key: 'Unordered list',
      wordsToSearch: ['无序列表', 'wuxuliebiao', 'wxlb'],
      name: 'Unordered list',
      className: 'format_ul',
      transform: (editor: LexicalEditor, selection: RangeSelection) => {
        insertList(editor, 'bullet')
      },
    },
    {
      key: 'Ordered list',
      wordsToSearch: ['有序列表', 'youxuliebiao', 'yxlb'],
      name: 'Ordered list',
      className: 'format_ol',
      transform: (editor: LexicalEditor, selection: RangeSelection) => {
        insertList(editor, 'number')
      },
    },
    {
      key: 'Check list',
      wordsToSearch: ['待办事项', 'daibanshixiang', 'dbsx'],
      name: 'Check list',
      className: 'format_todo',
      transform: (editor: LexicalEditor, selection: RangeSelection) => {
        insertList(editor, 'check')
      },
    },
    {
      key: 'BlockCode',
      wordsToSearch: ['代码块', 'daimakuai', 'dmk'],
      name: 'BlockCode',
      className: 'format_block_code',
      // @ts-expect-error
      transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, (targetNode: ElementNode) => {
        return $createCodeNode()
      }),
    },
    // {
    //   key: 'Latex',
    //   chineseKey: '公式块',
    //   chinesePinyinKey: 'gongshikuai',
    //   initialLetterOfChinesePinyinKey: 'gsk',
    //   name: t('format.formula'),
    //   className: 'format_formula',
    //   transform: (editor: LexicalEditor, selection: RangeSelection) => $wrapNodes(selection, (targetNode: ElementNode) => {
    //     const p = $createParagraphNode()
    //     const latex = $createLatexNode()
    //     latex.setEditing(true)
    //     p.append(latex)
    //     return p
    //   }),
    // },
  ]

  const blockFormats: BlockFormat[] = props.blockFormats ?? defaultBlockFormats
  const filterBlockFormats = ref(blockFormats)
  const isMListOrTodo = ref(false)
  let slashElementNodeKey: string | undefined
  const searchKeyword = ref('')
  /**
   * 斜杠的偏移量，所以去搜索关键词的时候得+1
   */
  let startOffset = -1
// 这里先放着
// let errorEndOffset = -1
// region 方法
  const hasAnyModify = (event: KeyboardEvent): boolean => {
    const {shiftKey, ctrlKey, metaKey, altKey} = event;
    return shiftKey || ctrlKey || metaKey || altKey
  }
  const $deleteFromSlash = (selection: RangeSelection) => {
    // TODO
  }
// endregion

  /**
   * 触发方式只有一种，按下/
   * 取消方式：
   * 1. 鼠标点击任意处
   * 2. 光标移出该行
   * 3. 输入文字搜索不到结果后再输入三个字符就不再显示
   */
  /**
   * TODO CTRL+COMMAND的效果
   * @param index
   */
  const onChoose = (index: number) => {
    if (!slashElementNodeKey || filterBlockFormats.value[index] === undefined) {
      console.table({slashElementNodeKey, 'filterBlockFormats.value[index]': filterBlockFormats.value[index]})
      return
    }
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchorKey = selection.anchor.key
        const anchorNode = editor.getEditorState()._nodeMap.get(anchorKey)
        const elementNode = anchorNode?.getTopLevelElement()
        const textContent = elementNode?.getTextContent()
        const textContentLength = elementNode?.getTextContentSize()
        if (!anchorNode || !elementNode || !$isElementNode(elementNode) || !textContent || !textContentLength) {
          console.table({anchorNode, elementNode})
          return
        }
        if (textContent === '/') {
          if ($isListNode(elementNode)) {
            editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);

            filterBlockFormats.value[index].transform(editor, selection)

            const anchorKey = selection.anchor.key
            const anchorNode = editor.getEditorState()._nodeMap.get(anchorKey)
            const elementNode_new = anchorNode?.getTopLevelElement()
            if (elementNode_new) {
              $getRoot().getChildren().forEach((node) => {
                if (node.__key === elementNode_new.__key)
                  node && node.getNextSibling() && node.getNextSibling()?.selectEnd()
              })
            }
          } else {
            editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
            filterBlockFormats.value[index].transform(editor, selection)
          }
        } else if (textContent?.startsWith('/') || textContent?.startsWith('、')) {
          const isWordOrChar = textContent.lastIndexOf('/') === textContentLength - 1
          const textIndex = isWordOrChar ? textContent.lastIndexOf('/') - 1 : textContent.lastIndexOf('/');
          let textIndexLength = textContent.substring(0, textIndex).length + 1
          let textNodeLength = textContent.substring(0, textIndex).length + 1
          isWordOrChar ? editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true) : editor.dispatchCommand(DELETE_WORD_COMMAND, true)
          while (textIndexLength !== 0) {
            editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined)
            // @ts-expect-error
            editor.dispatchCommand(MOVE_TO_END, undefined);
            editor.dispatchCommand(DELETE_LINE_COMMAND, true);
            --textIndexLength;
          }
          const newAnchorKey2 = editor.getEditorState()._nodeMap.get(($getSelection() as RangeSelection).anchor.key)
          while (textNodeLength !== 0) {
            !!newAnchorKey2?.getNextSibling() && newAnchorKey2.getNextSibling()?.remove()
            --textNodeLength;
          }
          filterBlockFormats.value[index].transform(editor, $getSelection() as RangeSelection)
        } else {
          $deleteFromSlash(selection)
          editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
          // @ts-expect-error
          editor.dispatchCommand(MOVE_TO_END, undefined);
          editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
          if ($isListNode(anchorNode?.getTopLevelElement())) {
            editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
          }

          filterBlockFormats.value[index].transform(editor, selection)
        }
        data.value.isShow = false
      }
    })
  }

  const onShow = () => {
    data.value.isShow = true
  }

  const onHide = () => {
    data.value.isShow = false
    slashElementNodeKey = undefined
    searchKeyword.value = ''
    startOffset = -1
    // errorEndOffset = -1
  }

  watch(() => searchKeyword.value, () => {
    if (searchKeyword.value === '') {
      filterBlockFormats.value = blockFormats
      return
    }
    filterBlockFormats.value = blockFormats.filter((b) => {
      return [b.key, ...b.wordsToSearch].some((word) => word.toLowerCase().includes(searchKeyword.value.toLowerCase()))
      // if (locale.value.startsWith('zh-')) {
      //   return b.chineseKey.includes(searchKeyword.value) || b.chinesePinyinKey.includes(searchKeyword.value) || b.initialLetterOfChinesePinyinKey.includes(searchKeyword.value)
      // } else {
      //   return b.key.toLowerCase().includes(searchKeyword.value.toLowerCase())
      // }
    })
    /* if(filterBlockFormats.value.length === 0 && errorEndOffset === -1){
      errorEndOffset = editor.getEditorState().read(() => {
        const sel = $getSelection()
        if(!$isRangeSelection(sel)){
          return -1
        }
        return sel.focus.offset
      })
    }else if(filterBlockFormats.value.length > 0){
      errorEndOffset = -1
    }
    console.log("errorEndOffset", errorEndOffset, 'searchKeyword.value.length', searchKeyword.value.length, 'startOffset', startOffset);
    if(errorEndOffset > -1 && searchKeyword.value.length - (errorEndOffset - startOffset) >= 3){
      onHide()
    } */
  })

  const onKeydown = (keyboardEvent: KeyboardEvent) => {
    let isProcess = false
    if (keyboardEvent.key === '/' && !hasAnyModify(keyboardEvent))
      isProcess = true

    // windows上输入、的时候，key为Process，code可能为Slash或Backslash
    // if (keyboardEvent.key === 'Process'
    //     && (keyboardEvent.code === 'Slash' || keyboardEvent.code === 'Backslash')
    //     && !hasAnyModify(keyboardEvent))
    //   isProcess = true

    // if (keyboardEvent.key === '、' && !hasAnyModify(keyboardEvent))
    //   isProcess = true

    if (!isProcess)
      return;

    const offset = editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchorKey = selection.anchor.key
        const anchorNode = $getNodeByKey(anchorKey)
        const elementNode = anchorNode?.getTopLevelElement()
        if (!$isElementNode(elementNode))
          return;

        if (anchorNode?.getKey() === elementNode.getKey())
          return anchorNode.getTextContentSize();

        // 给一个空的段落输入时
        if (elementNode.getChildrenSize() === 0)
          return 0

        let offset = 0
        for (let i = 0; i < elementNode.getChildrenSize(); i++) {
          if (elementNode.getChildAtIndex(i)?.getKey() === anchorKey)
            return offset + selection.anchor.offset

          offset += elementNode.getChildAtIndex(i)!.getTextContentSize()
        }
      }
    })
    const elementNode = editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchorKey = selection.anchor.key
        const anchorNode = $getNodeByKey(anchorKey)
        const elementNode = anchorNode?.getTopLevelElement()
        if ($isElementNode(elementNode))
          return elementNode
      }
    })
    if (!elementNode || offset === undefined) {
      console.warn('没有elementNode和offset', elementNode, offset)
      return;
    }
    const textContent = editor.getEditorState().read(() => {
      return elementNode.getTextContent()
    })
    startOffset = offset
    searchKeyword.value = textContent.substring(offset + 1)

    // 这里加上了延时，那么在366行的判断才不会为空，才不会隐藏下拉菜单，最后导致slashElementNodeKey为undefined
    setTimeout(() => {
      slashElementNodeKey = elementNode.__key
      data.value.isShow = true
      const range = window.getSelection()?.getRangeAt(0)
      const rootRect = editor.getRootElement()!.getBoundingClientRect()
      const editorInner = editor.getRootElement()!.closest('.editor-inner') as HTMLElement | null
      const scaleY = editorInner!.getBoundingClientRect().height / editorInner!.offsetHeight
      if (!range)
        return

      const element = editor.getElementByKey(elementNode.__key)
      if (!element)
        return;
      const yOffset = element.getBoundingClientRect().height
      const top = range.getBoundingClientRect().top + yOffset - rootRect.top
      const left = range.getBoundingClientRect().left - rootRect.left
      const height = filterBlockFormats.value.length * 36 + 10
      if (top + height > window.innerHeight) {
        // TODO 自动获取高度
        data.value.top = top - height - 20
      } else {
        data.value.top = top
      }
      data.value.top /= scaleY
      data.value.left = left
    }, 20)
  }

  onMounted(() => {
    editor.getRootElement()?.addEventListener('keydown', onKeydown)
    unregister = mergeRegister(
      editor.registerUpdateListener(
        ({tags, dirtyLeaves, editorState, prevEditorState}) => {
          if (!slashElementNodeKey)
            return

          editor.update(() => {
            const sel = $getSelection()
            if (!$isRangeSelection(sel))
              return

            const key = sel.anchor.getNode().getTopLevelElement()?.getKey()
            if (key !== slashElementNodeKey) {
              onHide()
              console.warn('hide dropdown menu')
              return;
            }
            const anchorKey = sel.anchor.key
            const anchorNode = $getNodeByKey(anchorKey)
            const elementNode = anchorNode?.getTopLevelElement()
            if (!$isElementNode(elementNode)) {
              console.warn('not elementNode', elementNode)
              return
            }
            const textContent = elementNode.getTextContent()
            if (!textContent.substring(startOffset).startsWith('/') && !textContent.substring(startOffset).startsWith('、')) {
              console.table({textContent, startOffset});
              onHide()
              return;
            }
            searchKeyword.value = textContent.substring(startOffset + 1)
          })
        },
      ),
    )
    rootContainer.value = editor.getRootElement()?.closest('.editor-container')!
  })

  onUnmounted(() => {
    if (unregister)
      unregister()
    editor.getRootElement()?.removeEventListener('keydown', onKeydown)
  })

  return {
    data,
    dropdownMenu,
    rootContainer,
    editor,
    onChoose,
    blockFormats,
    filterBlockFormats
  }
}
