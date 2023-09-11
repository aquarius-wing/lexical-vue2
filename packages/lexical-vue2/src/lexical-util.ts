import type {
  EditorState,
  ElementNode, GridSelection, LexicalEditor,
  LexicalNode,
  NodeKey, NodeSelection, Point,
  RangeSelection,
} from 'lexical';
import {
  $createRangeSelection,
  $getNodeByKey,
  $getPreviousSelection, $getRoot, $getSelection,
  $isElementNode,
  $isLeafNode, $isNodeSelection, $isParagraphNode, $isRangeSelection,
  $isRootNode, $isTextNode, $setSelection,
} from 'lexical';
import {$isQuoteNode} from "@lexical/rich-text";
import {$isListNode} from "@lexical/list";

export function exportNodeToJSON<SerializedNode>(node: LexicalNode): SerializedNode {
  const serializedNode = node.exportJSON();
  const nodeClass = node.constructor;

  // @ts-expect-error
  if (serializedNode.type !== nodeClass.getType())
    console.error('LexicalNode: Node nodeClass.name does not implement .exportJSON()')

  // @ts-expect-error
  const serializedChildren = serializedNode.children;

  if ($isElementNode(node)) {
    if (!Array.isArray(serializedChildren))
      console.error(`LexicalNode: Node ${nodeClass.name} is an element but .exportJSON() does not have a children array.`)

    const children = node.getChildren();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const serializedChildNode = exportNodeToJSON(child);
      serializedChildren.push(serializedChildNode);
    }
  }

  // @ts-expect-error
  return serializedNode;
}

export function $wrapNodes(
  selection: RangeSelection,
  createElement: () => ElementNode,
  wrappingElement?: ElementNode,
): void {
  const nodes = selection.getNodes();
  const nodesLength = nodes.length;
  const anchor = selection.anchor;

  if (
    nodesLength === 0
        || (nodesLength === 1
            && anchor.type === 'element'
            && anchor.getNode().getChildrenSize() === 0)
  ) {
    const target
            = anchor.type === 'text'
              ? anchor.getNode().getParentOrThrow()
              : anchor.getNode();
    const children = target.getChildren();
    let element = createElement();
    element.setFormat(target.getFormatType());
    element.setIndent(target.getIndent());
    children.forEach(child => element.append(child));
    if (wrappingElement)
      element = wrappingElement.append(element);

    /*
        * 踩坑：第一行的__parent为空，导致页面报错
        * 方法1：为target添加parent，会进入死循环，放弃
        * 方法2：在第一行后面添加element，再删除第一行，假如存在多行（即$getRoot().getChildren().length不为1，则需要遍历倒插元素），解决问题
        * 疑惑：为什么第一行的__parent为空？
        * */
    if (!target.__parent) {
      let delete_length = 1
      while (delete_length !== $getRoot().getChildren().length) {
        if (delete_length === 1) {
          $getRoot().append(element)
          $getRoot().selectEnd()
        }
        else {
          $getRoot().append($getRoot().getChildren()[1])
          $getRoot().selectStart()
        }
        delete_length++
      }
      if ($getRoot().getChildren().length === 1) {
        $getRoot().append(element)
        $getRoot().selectEnd()
        $getRoot().getFirstChild()?.remove()
      }
      else {
        $getRoot().getFirstChild()?.remove()
      }
    }
    else {
      target.replace(element)
    }

    return;
  }

  let topLevelNode: LexicalNode | null = null;
  let descendants: LexicalNode[] = [];
  for (let i = 0; i < nodesLength; i++) {
    const node = nodes[i];
    // Determine whether wrapping has to be broken down into multiple chunks. This can happen if the
    // user selected multiple Root-like nodes that have to be treated separately as if they are
    // their own branch. I.e. you don't want to wrap a whole table, but rather the contents of each
    // of each of the cell nodes.
    if ($isRootOrShadowRoot(node)) {
      $wrapNodesImpl(
        selection,
        descendants,
        descendants.length,
        createElement,
        wrappingElement,
      );
      descendants = [];
      topLevelNode = node;
    }
    else if (
      topLevelNode === null
            || (topLevelNode !== null && $hasAncestor(node, topLevelNode))
    ) {
      descendants.push(node);
    }
    else {
      $wrapNodesImpl(
        selection,
        descendants,
        descendants.length,
        createElement,
        wrappingElement,
      );
      descendants = [node];
    }
  }
  $wrapNodesImpl(
    selection,
    descendants,
    descendants.length,
    createElement,
    wrappingElement,
  );
}

export function $wrapNodesImpl(
  selection: RangeSelection | GridSelection,
  nodes: LexicalNode[],
  nodesLength: number,
  createElement: () => ElementNode,
  wrappingElement: null | ElementNode = null,
): void {
  if (nodes.length === 0)
    return;

  const firstNode = nodes[0];
  const elementMapping: Map<NodeKey, ElementNode> = new Map();
  const elements: ElementNode[] = [];
  // The below logic is to find the right target for us to
  // either insertAfter/insertBefore/append the corresponding
  // elements to. This is made more complicated due to nested
  // structures.
  let target = $isElementNode(firstNode)
    ? firstNode
    : firstNode.getParentOrThrow();

  if (target.isInline())
    target = target.getParentOrThrow();

  let targetIsPrevSibling = false;
  while (target !== null) {
    const prevSibling = target.getPreviousSibling<ElementNode>();
    if (prevSibling !== null) {
      target = prevSibling;
      targetIsPrevSibling = true;
      break;
    }

    target = target.getParentOrThrow();

    if ($isRootOrShadowRoot(target))
      break;
  }

  const emptyElements = new Set();

  // Find any top level empty elements
  for (let i = 0; i < nodesLength; i++) {
    const node = nodes[i];

    if ($isElementNode(node) && node.getChildrenSize() === 0)
      emptyElements.add(node.getKey());
  }

  const movedNodes: Set<NodeKey> = new Set();

  // Move out all leaf nodes into our elements array.
  // If we find a top level empty element, also move make
  // an element for that.
  for (let i = 0; i < nodesLength; i++) {
    const node = nodes[i];
    let parent = node.getParent();

    if (parent !== null && parent.isInline())
      parent = parent.getParent();

    if (
      parent !== null
            && $isLeafNode(node)
            && !movedNodes.has(node.getKey())
    ) {
      const parentKey = parent.getKey();

      if (elementMapping.get(parentKey) === undefined) {
        const targetElement = createElement();
        targetElement.setFormat(parent.getFormatType());
        targetElement.setIndent(parent.getIndent());
        elements.push(targetElement);
        elementMapping.set(parentKey, targetElement);
        // Move node and its siblings to the new
        // element.
        parent.getChildren().forEach((child) => {
          targetElement.append(child);
          movedNodes.add(child.getKey());
          if ($isElementNode(child)) {
            // Skip nested leaf nodes if the parent has already been moved
            child.getChildrenKeys().forEach(key => movedNodes.add(key));
          }
        });
        $removeParentEmptyElements(parent);
      }
    }
    else if (emptyElements.has(node.getKey())) {
      const targetElement = createElement();
      targetElement.setFormat(node.getFormatType());
      targetElement.setIndent(node.getIndent());
      elements.push(targetElement);
      node.remove(true);
    }
  }

  if (wrappingElement !== null) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      wrappingElement.append(element);
    }
  }
  let lastElement: ElementNode | null = null;

  // If our target is Root-like, let's see if we can re-adjust
  // so that the target is the first child instead.
  if ($isRootOrShadowRoot(target)) {
    if (targetIsPrevSibling) {
      if (wrappingElement !== null) {
        target.insertAfter(wrappingElement);
      }
      else {
        for (let i = elements.length - 1; i >= 0; i--) {
          const element = elements[i];
          target.insertAfter(element);
        }
      }
    }
    else {
      const firstChild = target.getFirstChild();

      if ($isElementNode(firstChild))
        target = firstChild;

      if (firstChild === null) {
        if (wrappingElement) {
          target.append(wrappingElement);
        }
        else {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            target.append(element);
            lastElement = element;
          }
        }
      }
      else {
        if (wrappingElement !== null) {
          firstChild.insertBefore(wrappingElement);
        }
        else {
          for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            firstChild.insertBefore(element);
            lastElement = element;
          }
        }
      }
    }
  }
  else {
    if (wrappingElement) {
      target.insertAfter(wrappingElement);
    }
    else {
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        target.insertAfter(element);
        lastElement = element;
      }
    }
  }

  const prevSelection = $getPreviousSelection();

  if (
    $isRangeSelection(prevSelection)
        && isPointAttached(prevSelection.anchor)
        && isPointAttached(prevSelection.focus)
  )
    $setSelection(prevSelection.clone());
  else if (lastElement !== null)
    lastElement.selectEnd();
  else
    selection.dirty = true;
}

export function $isRootOrShadowRoot(node: null | LexicalNode): boolean {
  return $isRootNode(node) || ($isElementNode(node) && node.isShadowRoot());
}

function $removeParentEmptyElements(startingNode: ElementNode): void {
  let node: ElementNode | null = startingNode;

  while (node !== null && !$isRootNode(node)) {
    const latest = node.getLatest();
    const parentNode: ElementNode | null = node.getParent<ElementNode>();
    if (latest.__children?.length === 0)
      node.remove(true);

    node = parentNode;
  }
}

export function $hasAncestor(
  child: LexicalNode,
  targetNode: LexicalNode,
): boolean {
  let parent = child.getParent();
  while (parent !== null) {
    if (parent.is(targetNode))
      return true;

    parent = parent.getParent();
  }
  return false;
}

function isPointAttached(point: Point): boolean {
  return point.getNode().isAttached();
}

export function selectionChange(selection: RangeSelection | NodeSelection | GridSelection | null, previousSelection: RangeSelection | NodeSelection | GridSelection | null): boolean {
  if (selection === null || previousSelection === null)
    return false

  if ($isRangeSelection(selection) && $isRangeSelection(previousSelection)
        && selection.anchor.key === previousSelection.anchor.key
        && selection.anchor.offset === previousSelection.anchor.offset
        && selection.focus.offset === previousSelection.focus.offset
        && selection.focus.offset === previousSelection.focus.offset
  )
    return false

  if ($isNodeSelection(selection) && $isNodeSelection(previousSelection)) {
    const nodes = selection.getNodes()
    const pNodes = previousSelection.getNodes()
    if (nodes.length !== pNodes.length)
      return true

    for (const node of nodes) {
      if (!previousSelection.has(node.getKey()))
        return true
    }
    return false
  }

  return true
}

export function getSelectedElementNodeKeys(): NodeKey[] | undefined {
  const selection = $getSelection()
  if (!$isRangeSelection(selection))
    return

  let keys = selection.getNodes().filter(n =>
    $isElementNode(n)
        && n.getTopLevelElement()?.getKey() === n.getKey(),
  ).map(n => n.getKey())
  if (selection.isBackward() && selection.anchor.offset === 0) {
    // selection.anchor是头，selection.focus是尾，但是头的偏移量是0
    const deleteKey = $getNodeByKey(selection.anchor.key)?.getTopLevelElement()?.getKey()
    keys = keys.filter(k => k !== deleteKey)
  }
  if (!selection.isBackward() && selection.focus.offset === 0) {
    // selection.focus是头，selection.anchor是尾，但是头的偏移量是0
    const deleteKey = $getNodeByKey(selection.focus.key)?.getTopLevelElement()?.getKey()
    keys = keys.filter(k => k !== deleteKey)
  }
  return keys
}

export function getNodeById(id: string): ElementNode | undefined {
  const root = $getRoot()
  for (const child of root.getChildren()) {
    if (!$isElementNode(child))
      return

    if (child.getId() === id)
      return child
  }
}

export function setSelectionToEnd(editorDom: HTMLInputElement) {
  const lastElementChild = editorDom.lastElementChild
  if (!lastElementChild) {
    console.warn('lastElementChild not found')
    return
  }
  const nodeToFocus = lastElementChild.lastChild
  if (!nodeToFocus || !nodeToFocus.textContent) {
    console.warn('nodeToFocus not found')
    return;
  }
  const selection = window.getSelection()
  if (!selection) {
    console.warn('selection not found')
    return;
  }
  selection.removeAllRanges()
  const range = new Range()
  range.setStart(nodeToFocus, 1)
  range.setEnd(nodeToFocus, 1)
  selection.addRange(range)
}

export function isInputKeyword(editor: LexicalEditor,
  callback: (textContent: string, anchorOffset: number, prevAnchorOffset: number) => boolean,
  nodeTypes: string[],
  { tags, dirtyLeaves, editorState, prevEditorState }:
  { tags: Set<string>; dirtyLeaves: Set<string>; editorState: EditorState; prevEditorState: EditorState },
): {
    anchorKey: NodeKey
    textContent: string
    top: number
    left: number
  } | undefined {
  if (tags.has('historic'))
    return;

  const selection = editorState.read($getSelection);
  const prevSelection = prevEditorState.read($getSelection);

  if (
    !$isRangeSelection(prevSelection)
        || !$isRangeSelection(selection)
        || !selection.isCollapsed()
  ) {
    // console.warn('selection 不是 range selection')
    return;
  }

  const anchorKey = selection.anchor.key;
  const anchorOffset = selection.anchor.offset;
  const prevAnchorOffset = prevSelection.anchor.offset;

  const anchorNode = editorState._nodeMap.get(anchorKey);
  if (
    !$isTextNode(anchorNode)
        || !dirtyLeaves.has(anchorKey) // ||
        // 当删除一个字符时，下面的条件满足
        // (anchorOffset !== 1 && anchorOffset !== prevSelection.anchor.offset + 1)
  )
    return;

  const parentNode = anchorNode.getParent();
  const elementNode = anchorNode.getTopLevelElement()
  if (parentNode === null || elementNode === null
        || !nodeTypes.includes(parentNode?.getType()))
    return;

  const textContent = anchorNode.getTextContent()
  if (!callback(textContent, anchorOffset, prevAnchorOffset))
    return;

  const element = editor.getElementByKey(anchorNode.getKey())
  if (!element)
    return;
  const yOffset = element.getBoundingClientRect().height
  const range = window.getSelection()?.getRangeAt(0)
  if (!range)
    return

  const top = range.getBoundingClientRect().top + yOffset
  const left = range.getBoundingClientRect().left
  return {
    anchorKey,
    textContent,
    top,
    left,
  };
}

/**
 * 使用的场景是在删除[的时候同时也删除紧跟着后面的]
 * 在里调用，因为根据prevEditorState拿不到旧的文本，也就无从得知是否是删除了[
 * @param leftChar
 * @param rightChar
 */
export const $deleteRightCharWhenDeleteLeftChar = (leftChar: string, rightChar: string): boolean | undefined => {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) {
    console.warn('not range selection')
    return
  }
  const anchorOffset = selection.anchor.offset
  const anchorNode = $getNodeByKey(selection.anchor.key);
  if (!$isTextNode(anchorNode)) {
    console.warn('anchorNode not textNode')
    return
  }
  const parentNode = anchorNode.getTopLevelElement()
  if (!$isParagraphNode(parentNode)
        && !$isQuoteNode(parentNode)
        && !$isListNode(parentNode)
  ) {
    console.warn('parentNode not MParagraphNode && MQuoteNode && MListNode', parentNode)
    return
  }
  if (!anchorNode) {
    console.warn('anchorNode not exist')
    return
  }
  if (anchorOffset === 0) {
    console.warn('not left character')
    return;
  }
  if (anchorOffset === anchorNode.getTextContent().length) {
    console.warn('not right character')
    return;
  }
  if (anchorNode.getTextContent().substring(anchorOffset - leftChar.length, anchorOffset) !== leftChar) {
    console.warn('left char is not', leftChar)
    return;
  }
  if (anchorNode.getTextContent().substring(anchorOffset, anchorOffset + rightChar.length) !== rightChar) {
    console.warn('right char is not', rightChar)
    return;
  }
  const textContent = anchorNode.getTextContent()
  anchorNode.setTextContent(
    textContent.substring(0, anchorOffset - leftChar.length)
        + textContent.substring(anchorOffset + rightChar.length, textContent.length),
  )
  const rangeSelection = $createRangeSelection()
  rangeSelection.setTextNodeRange(
    anchorNode,
    anchorOffset - leftChar.length,
    anchorNode,
    anchorOffset - leftChar.length,
  )
  $setSelection(rangeSelection)
  return true
}

/**
 * 使用的场景是在新增[的时候同时也新增紧跟着后面的]
 * 在registerUpdateListener里调用
 * @param leftChar
 * @param allChar
 */
export const $replaceAllCharWhenAddLeftChar = (leftChar: string, allChar: string, editorState: EditorState, prevEditorState: EditorState, tags: Set<string>, editor: LexicalEditor): boolean | undefined => {
  if (tags.has('historic')) {
    // console.warn('tags is historic')
    return;
  }
  const selection = editorState.read($getSelection);
  const prevSelection = prevEditorState.read($getSelection);
  if (
    !$isRangeSelection(prevSelection)
        || !$isRangeSelection(selection)
        || !selection.isCollapsed()
  ) {
    // console.warn('selection 不是 range selection', selection)
    return;
  }

  const anchorOffset = selection.anchor.offset;
  const prevAnchorOffset = prevSelection.anchor.offset;

  const anchorNode = editorState._nodeMap.get(selection.anchor.key);
  // 只允许在段落里进行这样的操作，后面在把这种逻辑剥离出去
  if (!$isParagraphNode(anchorNode?.getTopLevelElement())) {
    return
  }
  const prevAnchorNode = prevEditorState._nodeMap.get(prevSelection.anchor.key);
  if (!$isTextNode(anchorNode)) {
    // console.warn('anchorNode not textNode')
    return
  }

  if (!anchorNode) {
    // console.warn('anchorNode not exist')
    return
  }

  // windows的情况下输入的中文符号后会带上这个ZWSP，所以要替换掉
  const lengthOfAnchorNode = anchorNode.__text?.replace(/\u200B/g, '').length
  const lengthOfPrevAnchorNode = prevAnchorNode?.__text?.replace(/\u200B/g, '').length

  if (anchorNode.__type === prevAnchorNode?.__type
    && (anchorOffset <= prevAnchorOffset
        || ($isTextNode(prevAnchorNode) && lengthOfAnchorNode === lengthOfPrevAnchorNode))
  ) {
    // console.warn('前后节点相同时不是新增字符')
    // console.table({ anchorOffset, prevAnchorOffset, lengthOfAnchorNode, lengthOfPrevAnchorNode })
    return
  }
  const textContent = anchorNode.getTextContent()
  if (textContent.substring(anchorOffset - leftChar.length, anchorOffset) !== leftChar) {
    // console.warn('增加的字符不是', leftChar, '增加的是', textContent.substring(anchorOffset - leftChar.length, anchorOffset))
    return
  }
  const newTextContent = textContent.substring(0, anchorOffset - leftChar.length)
        + allChar
        + textContent.substring(anchorOffset, textContent.length)
  /**
   * 如果不延时，当你输出（，然后要替换成()，然后
   * 1. 在LexicalEvents里onInput会继续处理输入的最后一个（
   * 2. 在$updateSelectedTextFromDOM，characterData为（
   * 3. 在$updateTextNodeFromDOMContent，textContent就已经被拼接了(（)
   * TODO 后续要优化成不用setTimeout
   */
  setTimeout(() => {
    editor.update(() => {
      anchorNode.setTextContent(newTextContent)
      const rangeSelection = $createRangeSelection()
      rangeSelection.setTextNodeRange(
        anchorNode,
        anchorOffset,
        anchorNode,
        anchorOffset,
      )
      $setSelection(rangeSelection)
    })
  }, 20)
  return true
}
/**
 * 使用的场景是解决当前行是可以正常响应一级标题，但是当前行的下一行就会生成一个空的一级标题，新增一个新的方法处理选中的文本
 * @param selection
 * @param createElement
 */
export function $WrapSelectNode(selection: RangeSelection, createElement: () => ElementNode) {
  const anchor = selection.anchor;
  const target
        = anchor.type === 'text'
          ? anchor.getNode().getParentOrThrow()
          : anchor.getNode();
  const children = target.getChildren();
  const element = createElement();
  element.setFormat(target.getFormatType());
  element.setIndent(target.getIndent());
  children.forEach(child => element.append(child));
  target.replace(element);
  return target
}
/**
 * 使用的场景是解决latex块级样式
 * @param selection
 * @param createElement
 */
export function $WrapLatexNode(selection: RangeSelection, createElement: () => ElementNode) {
  const nodes = selection.getNodes();
  const nodesLength = nodes.length;
  const anchor = selection.anchor;

  if (
    nodesLength === 0
        || (nodesLength === 1
            && anchor.type === 'element'
            && anchor.getNode().getChildrenSize() === 0)
  ) {
    const target
            = anchor.type === 'text'
              ? anchor.getNode().getParentOrThrow()
              : anchor.getNode();
    const element = createElement();
    element.setEditing(true)
    if (!target.__parent) {
      let delete_length = 1
      while (delete_length !== $getRoot().getChildren().length) {
        if (delete_length === 1) {
          $getRoot().append(element)
          $getRoot().selectEnd()
        }
        else {
          $getRoot().append($getRoot().getChildren()[1])
          $getRoot().selectStart()
        }
        delete_length++
      }
      if ($getRoot().getChildren().length === 1) {
        $getRoot().append(element)
        $getRoot().selectEnd()
        $getRoot().getFirstChild()?.remove()
        $setSelection(null)
      }
      else {
        $getRoot().getFirstChild()?.remove()
        $setSelection(null)
      }
    }
    else {
      const target
                = anchor.type === 'text'
                  ? anchor.getNode().getParentOrThrow()
                  : anchor.getNode();
      const element = createElement();
      element.setEditing(true)

      target.insertAfter(element)
      target.remove()
      $setSelection(null)
    }
  }
  else {
    const target = anchor.getNode()
    const element = createElement();
    element.setEditing(true)
    target.insertBefore(element)
    $setSelection(null)
  }
}
/**
 * 块级样式高度
 */
export const formatHeight: { [key: string]: number } = {
  'm-paragraph': 32,
  'm-quote': 80,
  'm-latex': 46.4,
  'h1': 60,
  'h2': 48,
  'h3': 36,
  'm-code': 75,
  'm-divider': 1,
}

/**
 * 格式化文本
 * @param format
 * TODO
 * https://github.com/facebook/lexical/blob/9ef66af7969a159349e18474b143d1f0f3358964/packages/lexical/src/LexicalUtils.ts#L183https://github.com/aquarius-wing/lexical/blob/9ef66af7969a159349e18474b143d1f0f3358964/packages/lexical/src/LexicalUtils.ts#L183
 */
export const mapFormat = (format: number) => {
  switch (format) {
    case 0:
      return [false, false, false, false, false]
    case 1:
      return [true, false, false, false, false]
    case 2:
      return [false, true, false, false, false]
    case 3:
      return [true, true, false, false, false]
    case 4:
      return [false, false, false, true, false]
    case 5:
      return [true, false, false, true, false]
    case 6:
      return [false, true, false, true, false]
    case 7:
      return [true, true, false, true, false]
    case 8:
      return [false, false, true, false, false]
    case 9:
      return [true, false, true, false, false]
    case 10:
      return [false, true, true, false, false]
    case 11:
      return [true, true, true, false, false]
    case 12:
      return [false, false, true, true, false]
    case 13:
      return [true, false, true, true, false]
    case 14:
      return [false, true, true, true, false]
    case 15:
      return [true, true, true, true, false]
    case 16:
      return [false, false, false, false, true]
    case 17:
      return [true, false, false, false, true]
    case 18:
      return [false, true, false, false, true]
    case 19:
      return [true, true, false, false, true]
    case 20:
      return [false, false, false, true, true]
    case 21:
      return [true, false, false, true, true]
    case 22:
      return [false, true, false, true, true]
    case 23:
      return [true, true, false, true, true]
    case 24:
      return [false, false, true, false, true]
    case 25:
      return [true, false, true, false, true]
    case 26:
      return [false, true, true, false, true]
    case 27:
      return [true, true, true, false, true]
    case 28:
      return [false, false, true, true, true]
    case 29:
      return [true, false, true, true, true]
    case 30:
      return [false, true, true, true, true]
    case 31:
      return [true, true, true, true, true]
  }
}

export function getCachedClassNameArray<T>(
  classNamesTheme: T,
  classNameThemeType: string,
): Array<string> {
  const classNames = classNamesTheme[classNameThemeType];
  // As we're using classList, we need
  // to handle className tokens that have spaces.
  // The easiest way to do this to convert the
  // className tokens to an array that can be
  // applied to classList.add()/remove().
  if (typeof classNames === 'string') {
    const classNamesArr = classNames.split(' ');
    classNamesTheme[classNameThemeType] = classNamesArr;
    return classNamesArr;
  }
  return classNames;
}