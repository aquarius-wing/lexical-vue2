import {$applyNodeReplacement, EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread, TextNode} from "lexical";
import EmojiData from './emoji-data.json'
import {TextMatchTransformer} from "@lexical/markdown";

export type SerializedEmojiNode = Spread<
  {
  },
  SerializedTextNode
>;

export class EmojiNode extends TextNode {

  static getType(): string {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    const inner = document.createElement('span');
    inner.innerHTML = EmojiData[this.__text];
    inner.className = 'emoji-inner';
    dom.appendChild(inner);
    return dom;
  }

  updateDOM(
    prevNode: TextNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const inner = dom.firstChild;
    if (inner === null) {
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const node = $createEmojiNode(
      serializedNode.text,
    );
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: 'emoji',
    };
  }

  getTextContent(): string {
    return EmojiData[this.__text];
  }

}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
  return node instanceof EmojiNode;
}

export function $createEmojiNode(
  emojiText: string,
): EmojiNode {
  const node = new EmojiNode(emojiText).setMode('token');
  return $applyNodeReplacement(node);
}

export const EMOJI: TextMatchTransformer = {
  dependencies: [EmojiNode],
  export: (node: LexicalNode) => {
    if (!$isEmojiNode(node)) { return null }
    return `:${node.__text}:`
  },
  importRegExp: /:(.*?):/,
  regExp: /:(.*?):/,
  replace: (textNode, match: RegExpMatchArray) => {
    const [, text] = match;
    if (EmojiData[text]) {
      const emojiNode = $createEmojiNode(text);
      textNode.replace(emojiNode);
    }
  },
  trigger: ':',
  type: 'text-match'

}