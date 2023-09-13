// @ts-nocheck
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {$applyNodeReplacement, createEditor, TextNode} from 'lexical';
import {TextMatchTransformer} from "@lexical/markdown";
function convertImageElement(domNode) {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src, width, height } = domNode;
        const node = $createImageNode({ altText, height, src, width });
        return { node };
    }
    return null;
}
export class ImageNode extends TextNode {
    static getType() {
        return 'image';
    }
    static clone(node) {
        return new ImageNode(node.__src, node.__altText, node.__title, node.__maxWidth, node.__width, node.__height, node.__showCaption, node.__caption, node.__captionsEnabled, node.__key);
    }
    static importJSON(serializedNode) {
        const { altText, height, width, maxWidth, caption, src, showCaption, title } = serializedNode;
        const node = $createImageNode({
            altText,
            title,
            height,
            maxWidth,
            showCaption,
            src,
            width,
        });
        const nestedEditor = node.__caption;
        const editorState = nestedEditor.parseEditorState(caption.editorState);
        if (!editorState.isEmpty()) {
            nestedEditor.setEditorState(editorState);
        }
        return node;
    }
    exportDOM() {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        element.setAttribute('title', this.__title);
        element.setAttribute('width', this.__width.toString());
        element.setAttribute('height', this.__height.toString());
        return { element };
    }
    static importDOM() {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        };
    }
    constructor(src, altText, title, maxWidth, width, height, showCaption, caption, captionsEnabled, key) {
        super(key);
        this.__src = src;
        this.__title = title;
        this.__altText = altText;
        this.__maxWidth = maxWidth;
        this.__width = width || 'inherit';
        this.__height = height || 'inherit';
        this.__showCaption = showCaption || false;
        this.__caption = caption || createEditor();
        this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
    }
    exportJSON() {
        return {
            altText: this.getAltText(),
            caption: this.__caption.toJSON(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            showCaption: this.__showCaption,
            src: this.getSrc(),
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
        };
    }
    setWidthAndHeight(width, height) {
        const writable = this.getWritable();
        writable.__width = width;
        writable.__height = height;
    }
    setShowCaption(showCaption) {
        const writable = this.getWritable();
        writable.__showCaption = showCaption;
    }
    // View
    createDOM(config) {
        const span = document.createElement('span');
        span.setAttribute('contenteditable', 'false');
        const theme = config.theme;
        const className = theme.image;
        if (className !== undefined) {
            span.className = className;
        }

        const img = document.createElement('img');
        img.setAttribute('src', this.__src);
        img.setAttribute('alt', this.__altText);
        img.setAttribute('title', this.__title);
        span.append(img)
        return span;
    }
    updateDOM() {
        return false;
    }
    getSrc() {
        return this.__src;
    }
    getAltText() {
        return this.__altText;
    }
    getTextContent(): string {
        return this.getSrc()
    }
}
export function $createImageNode({ altText, height, maxWidth = 500, captionsEnabled, src, width, showCaption, caption, key, title }) {
    const node = $applyNodeReplacement(new ImageNode(src, altText, title, maxWidth, width, height, showCaption, caption, captionsEnabled, key))
    node.setMode('token')
    return node;
}
export function $isImageNode(node) {
    return node instanceof ImageNode;
}

export const IMAGE: TextMatchTransformer = {
    dependencies: [ImageNode],
    export: (node, exportChildren, exportFormat) => {
        return `![${(node as ImageNode).getAltText()}](${node.getUrl()})`
    },
    importRegExp: /!\[(.*?)\]\((.*?)(\s".*?")?\)/,
    regExp: /!\[(.*?)\]\((.*?)(\s".*?")?\)/,
    replace: (textNode, match) => {
        const [_, altText, url, title] = match
        const imageNode = $createImageNode({
            altText,
            src: url,
            title
        })
        textNode.replace(imageNode)
    },
    trigger: ')',
    type: 'text-match',
}
