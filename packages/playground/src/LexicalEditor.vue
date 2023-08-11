<script>
import {LexicalComposer, LexicalRichTextPlugin, LexicalContentEditable} from 'lexical-vue2'
import {$createHeadingNode, HeadingNode, QuoteNode} from '@lexical/rich-text'
import {$createParagraphNode, $createTextNode, $getRoot} from "lexical";
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {HashtagNode} from "@lexical/hashtag";
import {$createImageNode, ImageNode} from "@/nodes/ImageNode";
export default {
  setup() {
    function prePopulatedRichText() {
      const root = $getRoot()
      if (root.getFirstChild() === null) {
        const heading = $createHeadingNode('h1')
        heading.append($createTextNode('Welcome to the playground'))
        root.append(heading)
        const image = $createImageNode({})
        const p = $createParagraphNode()
        p.append(image)
        root.append(p)
      }
    }
    const config = {
      editable: true,
      nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode,
        HashtagNode,
        ImageNode,
      ],
      editorState: prePopulatedRichText,
    }

    return {
      config
    }
  },
  components: {
    LexicalComposer,
    LexicalRichTextPlugin,
    LexicalContentEditable,
  },
}
</script>

<template>
  <LexicalComposer :initialConfig="config">
    <div class="editor-container">
      <div class="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input"/>
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
      </div>
    </div>
  </LexicalComposer>
</template>

<style>

</style>
