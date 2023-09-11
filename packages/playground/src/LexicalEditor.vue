<script>
import {
  LexicalComposer,
  LexicalRichTextPlugin,
  LexicalContentEditable,
  LexicalAutoFocusPlugin,
  LexicalAutoLinkPlugin,
  LexicalMarkdownShortcutPlugin,
  LexicalOnChangePlugin,
  LexicalTreeViewPlugin,
  LexicalHistoryPlugin,
  LexicalListPlugin,
  LexicalCheckListPlugin,
  LexicalTabIndentationPlugin,
  LexicalSlashMenuPlugin,
} from 'lexical-vue2'
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

    const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

    const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

    const MATCHERS = [
      (text) => {
        const match = URL_MATCHER.exec(text)
        return (
            match && {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: match[0],
            }
        )
      },
      (text) => {
        const match = EMAIL_MATCHER.exec(text)
        return (
            match && {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: `mailto:${match[0]}`,
            }
        )
      },
    ]

    const onChange = () => {
      console.log('change')
    }

    return {
      config,
      MATCHERS,
      onChange
    }
  },
  components: {
    LexicalComposer,
    LexicalRichTextPlugin,
    LexicalContentEditable,
    LexicalAutoFocusPlugin,
    LexicalAutoLinkPlugin,
    LexicalMarkdownShortcutPlugin,
    LexicalOnChangePlugin,
    LexicalTreeViewPlugin,
    LexicalHistoryPlugin,
    LexicalListPlugin,
    LexicalCheckListPlugin,
    LexicalTabIndentationPlugin,
    LexicalSlashMenuPlugin
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
        <LexicalAutoFocusPlugin/>
        <LexicalAutoLinkPlugin :matchers="MATCHERS"/>
        <LexicalMarkdownShortcutPlugin/>
        <LexicalOnChangePlugin v-on:change="onChange" />
        <LexicalTreeViewPlugin
            view-class-name="tree-view-output"
            time-travel-panel-class-name="debug-timetravel-panel"
            time-travel-button-class-name="debug-timetravel-button"
            time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
            time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
        <LexicalHistoryPlugin />
        <LexicalListPlugin />
        <LexicalCheckListPlugin />
        <LexicalTabIndentationPlugin />
        <LexicalSlashMenuPlugin />
      </div>
    </div>
  </LexicalComposer>
</template>

<style lang="scss">
.editor-container{
  position: relative;
}
.dropdown-menu {
  position: absolute;
  width: 300px;
  padding: 8px 0;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.14);
  z-index: 3000;

  .dropdown-menu-item {
    height: 36px;
    font-size: 14px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin: 0 8px;
    padding: 8px 8px;
    gap: 12px;

    .img-boxing {
      width: 20px;
      height: 20px;
      background: #e9e9e9;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    img {
      //width: 14px;
      //height: 14px;
    }

    &:hover {
      cursor: pointer;
    }

    &, * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #666666
    }
  }

  .dropdown-menu-item-active {
    background: #e9e9e9;
  }
}
</style>
