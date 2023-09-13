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
  LexicalSlashMenuPlugin, DividerNode, DIVIDER, EMOJI, EmojiNode, ImageNode, IMAGE
} from 'lexical-vue2'
import {HeadingNode, QuoteNode} from '@lexical/rich-text'
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {HashtagNode} from "@lexical/hashtag";
import {$convertFromMarkdownString, TRANSFORMERS} from "@lexical/markdown";
import ExampleMd from './assets/example.md'
import LexicalReloadPlugin from "@/LexicalReloadPlugin.vue";

export default {
  computed: {
    IMAGE() {
      return IMAGE
    },
    EMOJI() {
      return EMOJI
    },
    DIVIDER() {
      return DIVIDER
    },
    TRANSFORMERS() {
      return TRANSFORMERS
    },
    MY_TRANSFORMERS() {
      return [EMOJI, DIVIDER, ...TRANSFORMERS]
    }
  },
  setup() {
    // function prePopulatedRichText() {
    //   const root = $getRoot()
    //   if (root.getFirstChild() === null) {
    //     const heading = $createHeadingNode('h1')
    //     heading.append($createTextNode('Welcome to the playground'))
    //     root.append(heading)
    //     const image = $createImageNode({src: 'https://qiniu.keepwork.com/70-5fd74149-814e-472d-8bec-44b56ae92b56.jpg?e=4834193186&token=LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq:t7PphTkSZPsZWZLDni7cJkrGvRo='})
    //     const p = $createParagraphNode()
    //     p.append(image)
    //     root.append(p)
    //     root.append(
    //         $createParagraphNode()
    //             .append($createImageNode({src: 'https://octodex.github.com/images/minion.png'}))
    //     )
    //     root.append($createParagraphNode())
    //   }
    // }
    console.log("ExampleMd", ExampleMd);
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
        DividerNode,
        EmojiNode,
      ],
      editorState: () => $convertFromMarkdownString(ExampleMd, [IMAGE, EMOJI, DIVIDER, ...TRANSFORMERS]),
    }

    const onError = (error) => {
      console.error(error)
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
      onChange,
      onError
    }
  },
  components: {
    LexicalReloadPlugin,
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
  <LexicalComposer :initialConfig="config" @error="onError">
    <div class="editor-container">
      <div class="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input markdown-body"/>
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalAutoFocusPlugin/>
        <LexicalAutoLinkPlugin :matchers="MATCHERS"/>
        <LexicalMarkdownShortcutPlugin :transformers="[IMAGE, EMOJI, DIVIDER, ...TRANSFORMERS]"/>
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
        <LexicalReloadPlugin />
      </div>
    </div>
  </LexicalComposer>
</template>

<style lang="scss">
@import '~github-markdown-css/github-markdown.css';

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
    .dropdown-menu-item-subtitle{
      color: #858a90;
    }

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
