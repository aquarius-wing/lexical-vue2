# lexical-vue2
An extensible Vue 3 web text-editor based on [Lexical](https://github.com/facebook/lexical).

For documentation and more information about Lexical, be sure to visit the [Lexical website](https://lexical.dev/).

## Getting started with Vue2

> Requires Vue >= 2.6.0.

```bash
npm install lexical-vue2 # or pnpm or yarn
```

Below is an example of a basic plain text editor using `lexical` and `lexical-vue2`.


```vue
<script>
import {
  LexicalComposer,
  LexicalRichTextPlugin,
  LexicalContentEditable,
  LexicalAutoFocusPlugin,
  LexicalAutoLinkPlugin,
  LexicalMarkdownShortcutPlugin,
  LexicalTreeViewPlugin
} from 'lexical-vue2'
import {$createHeadingNode, HeadingNode, QuoteNode} from '@lexical/rich-text'
import {$createParagraphNode, $createTextNode, $getRoot} from "lexical";
import {ListItemNode, ListNode} from "@lexical/list";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {HashtagNode} from "@lexical/hashtag";

export default {
  setup() {
    function prePopulatedRichText() {
      const root = $getRoot()
      if (root.getFirstChild() === null) {
        const heading = $createHeadingNode('h1')
        heading.append($createTextNode('Welcome to the playground'))
        root.append(heading)
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
        HashtagNode
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

    return {
      config,
      MATCHERS
    }
  },
  components: {
    LexicalComposer,
    LexicalRichTextPlugin,
    LexicalContentEditable,
    LexicalAutoFocusPlugin,
    LexicalAutoLinkPlugin,
    LexicalMarkdownShortcutPlugin,
    LexicalTreeViewPlugin,
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
        <LexicalTreeViewPlugin
            view-class-name="tree-view-output"
            time-travel-panel-class-name="debug-timetravel-panel"
            time-travel-button-class-name="debug-timetravel-button"
            time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
            time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
      </div>
    </div>
  </LexicalComposer>
</template>
```

## Contributing

1. Create a new branch
   - `git checkout -b my-new-branch`
2. Commit your changes
   - `git commit -a -m 'Description of the changes'`
     - There are many ways of doing this and this is just a suggestion
3. Push your branch to GitHub
   - `git push origin my-new-branch`
4. Go to the repository page in GitHub and click on "Compare & pull request"
   - The [GitHub CLI](https://cli.github.com/manual/gh_pr_create) allows you to skip the web interface for this step (and much more)

## License

MIT
