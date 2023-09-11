import {onMounted, onUnmounted, provide, ref, watch} from '@vue/composition-api';
import {
  COMMAND_PRIORITY_LOW, COMMAND_PRIORITY_NORMAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
} from 'lexical';
import {useEditor} from '@/composables/useEditor';
import {mergeRegister} from "@lexical/utils";

function useDropdownMenu(props, emit) {

// add 选中工具栏，需要新增办法判断hide逻辑

// region 数据
//   const emit = defineEmits<{
//     (e: 'hide'): void
//     (e: 'choose', index: number): void
//   }>()
  const index = ref(0)
  const updateIndex = (i: number) => {
    index.value = i
  }
  provide('index', {
    index,
    updateIndex,
  })
  const editor = useEditor()
  const dropdownMenu = ref<HTMLElement>()
  let itemCount = 0
// endregion

// region 方法
  watch(() => props.isShow, () => {
    index.value = 0
  })

// endregion

// region 事件
  const onKeydown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)
      return

    if (e.key === 'ArrowUp') {
      onArrowUpOrDown(true)
      e.preventDefault()
      e.stopPropagation()
    }
    if (e.key === 'ArrowDown') {
      onArrowUpOrDown(false)
      e.preventDefault()
      e.stopPropagation()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      if (!e.isComposing)
        onEnter()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onEsc()
    }
  }
  const onArrowUpOrDown = (isUp: boolean) => {
    if (dropdownMenu.value?.querySelectorAll('.dropdown-menu-item'))
      itemCount = dropdownMenu.value?.querySelectorAll('.dropdown-menu-item').length

    const oldIndex = index.value
    let newIndex
    if (isUp)
      newIndex = Math.max(0, index.value - 1)

    else
      newIndex = Math.min(itemCount - 1, index.value + 1)

    updateIndex(newIndex)
    onKeydownToUpdateIndex(newIndex, oldIndex)
  }
  const onEnter = () => {
    // 加上这个的话，editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);会无法生效
    /* const sel = window.getSelection()
    if(sel){
      sel.removeAllRanges()
      if(HandleHide.firstRange){
        sel.addRange(HandleHide.firstRange)
      }
    } */
    emit('choose', index.value)
    // emitter.emit(DOCUMENT_INSERT_BLOCK_TOOL_CHOOSE_COMMAND, index.value)
  }
  provide('onEnter', onEnter)
  const onEsc = () => {
    /* const sel = window.getSelection()
    if(sel){
      sel.removeAllRanges()
      if(HandleHide.firstRange){
        sel.addRange(HandleHide.firstRange)
      }
    } */
    emit('hide')
  }
  const onKeydownToUpdateIndex = (newIndex: number, oldIndex: number) => {
    const element = dropdownMenu.value?.querySelectorAll('.dropdown-menu-item')[index.value] as HTMLElement
    if (!element)
      return

    const padding = 4
    if (newIndex > oldIndex) {
      if (element.offsetTop + element.offsetHeight > dropdownMenu.value!.offsetHeight) {
        dropdownMenu.value?.scrollTo({
          top: element.offsetTop - dropdownMenu.value?.offsetHeight + element.offsetHeight + padding,
          left: 0,
          behavior: 'smooth', // 平滑滚动
        })
      }
    } else {
      if (element.offsetTop < dropdownMenu.value!.scrollTop) {
        dropdownMenu.value?.scrollTo({
          top: element.offsetTop - padding,
          left: 0,
          behavior: 'smooth', // 平滑滚动
        })
      }
    }
  }

// endregion

  class HandleHide {
    static isFirst = true
    static firstRange: Range | undefined
    static unregister: () => void

    static register() {
      // 1. 按左右的时候关闭
      // 在onKeydown里已经实现
      /**
       * 不再用selectionchange是因为
       * 1. 点击块编辑器
       * 2. 设置对应节点的selected为true
       * 3. 重新createDOM
       * 导致意外地触发selectionchange，无法用range对象、外部的值来进行规避
       * 所以改为click
       *
       * 用selectionchange是因为如果用click，在文本中输入/的dropdown在选中项目后document.activeElement为body
       */
      if (props.hiddenOnSelectionChange) {
        // 2. range change的时候实现
        document.addEventListener('selectionchange', HandleHide.onSelectionChange)
      }
      if (props.hiddenOnClick) {
        // 2. click实现
        document.addEventListener('click', HandleHide.onClick)
      }
      if (props.hiddenOnRangeClick) {
        // 2. click实现
        document.addEventListener('click', HandleHide.onRangeClick)
      }
      // 3. editor要不响应ENTER
      HandleHide.unregister = mergeRegister(
        editor.registerCommand(
          KEY_ENTER_COMMAND,
          (event: KeyboardEvent | null) => {
            if (event !== null)
              event.preventDefault();

            return true;
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_ESCAPE_COMMAND,
          (e: KeyboardEvent) => {
            e.preventDefault()
            e.stopPropagation()
            onEsc()
            return true
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          KEY_ARROW_UP_COMMAND,
          (e: KeyboardEvent) => {
            e.preventDefault()
            return true
          },
          COMMAND_PRIORITY_NORMAL,
        ),
        editor.registerCommand(
          KEY_ARROW_DOWN_COMMAND,
          (e: KeyboardEvent) => {
            e.preventDefault()
            return true
          },
          COMMAND_PRIORITY_NORMAL,
        ),
      )
    }

    static unRegister() {
      // 1. 按左右的时候关闭
      if (props.hiddenOnSelectionChange) {
        // 2. range change的时候实现
        document.removeEventListener('selectionchange', HandleHide.onSelectionChange)
      }
      if (props.hiddenOnClick) {
        // 2. click实现
        document.removeEventListener('click', HandleHide.onClick)
      }
      if (props.hiddenOnRangeClick) {
        // 2. click实现
        document.removeEventListener('click', HandleHide.onRangeClick)
      }
      // 3. editor要不响应ENTER
      HandleHide.unregister()
    }

    static onSelectionChange() {
      if (window.getSelection()?.rangeCount && window.getSelection()!.rangeCount > 0) {
        const currentRange = window.getSelection()?.getRangeAt(0)
        if (currentRange && document.querySelector('.dropdown-menu')?.contains(currentRange.startContainer))
          return;

        if (currentRange !== HandleHide.firstRange)
          emit('hide')
      }
    }

    static onClick(e: MouseEvent) {
      console.log(e);
      if ((e.target as Element).closest('.dropdown-menu'))
        return

      if ((e.target as Element).closest('.block-tool-btn'))
        return

      emit('hide')
    }

    // 新增工具栏hide
    static onRangeClick(e: MouseEvent) {
      if ((e.target as Element).closest('.dropdown-menu'))
        return

      if ((e.target as Element).closest('.editor-container'))
        return

      if ((e.target as Element).closest('.hover-toolbar-item'))
        return

      if ((e.target as Element).closest('.hover-toolbar'))
        return

      // if (e?.path[0]?.nodeName === 'HTML')
      //   return
      //
      // if (e.target?.className?.includes('app-container'))
      //   return;

      emit('hide')
    }
  }

  onMounted(() => {
    if (props.element) {
      props.element.addEventListener('keydown', onKeydown)
    } else {
      document.addEventListener('keydown', onKeydown)
    }
    HandleHide.register()
    if (dropdownMenu.value?.querySelectorAll('.dropdown-menu-item'))
      itemCount = dropdownMenu.value?.querySelectorAll('.dropdown-menu-item').length
  })

  onUnmounted(() => {
    if (props.element) {
      props.element.removeEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
    HandleHide.unRegister()
  })

  return {
    dropdownMenu
  }
}

export default useDropdownMenu