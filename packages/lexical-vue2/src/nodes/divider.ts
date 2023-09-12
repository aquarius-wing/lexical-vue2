// @ts-nocheck
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
  LexicalEditor
} from 'lexical'
import { $createParagraphNode, $getRoot, $isElementNode, DecoratorNode, ElementNode } from 'lexical'
import { ElementTransformer } from '@lexical/markdown'
import {addClassNamesToElement} from "@lexical/utils";

type SerializedCodeNode = Spread<
    {
      type: 'divider'
      version: 1
    },
    SerializedElementNode
    >;

export class DividerNode extends ElementNode {
  static getType(): string {
    return 'divider'
  }

  static clone(node: DividerNode): DividerNode {
    return new DividerNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  // View

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: () => ({ node: $createDividerNode() }),
        priority: 0,
      }),
    }
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const hr = document.createElement('hr')
    hr.setAttribute('contenteditable', 'false');
    addClassNamesToElement(hr, config.theme.divider);
    return hr
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') }
  }

  static importJSON(serializedNode: SerializedCodeNode): DividerNode {
    const node = $createDividerNode()
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportJSON(): SerializedCodeNode {
    return {
      ...super.exportJSON(),
      type: 'divider',
      version: 1,
    }
  }

  // Mutation

  canIndent(): false {
    return false
  }

  canInsertAfter(node: LexicalNode): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }

  isInline(): false {
    return false
  }

  getTextContent(): string {
    return '\n'
  }

}

export function $createDividerNode(): DividerNode {
  return new DividerNode()
}

export function $isDividerNode(
  node: LexicalNode | null | undefined,
): node is DividerNode {
  return node instanceof DividerNode
}

const replaceWithBlock = (
  createNode: (match: Array<string>) => ElementNode | DecoratorNode<unknown>,
): ElementTransformer['replace'] => {
  return (parentNode, children, match) => {
    const node = createNode(match)
    if ($isElementNode(node)) {
      node.append(...children)
    }

    parentNode.replace(node)
    if ($isElementNode(node)) {
      node.select(0, 0)
    }
  }
}

export const DIVIDER: ElementTransformer = {
  dependencies: [DividerNode],
  export: (node: LexicalNode) => {
    if (!$isDividerNode(node)) { return null }
    return '---'
  },
  regExp: /^---\W?$/,
  replace: (parentNode, children, match, isImport) => {
    const dividerNode = $createDividerNode()
    const func = replaceWithBlock(() => {
      return dividerNode
    })
    func(parentNode, children, match, isImport)
    const root = $getRoot()
    if (root.getLastChild()?.getKey() === dividerNode.getKey() && !isImport) {
      const p = $createParagraphNode()
      p.select()
      root.append(p)
    } else {
      dividerNode.getNextSibling()?.select(0, 0)
    }
    dividerNode.markDirty()
  },
  type: 'element',
}
