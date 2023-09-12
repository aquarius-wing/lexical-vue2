import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);

// 写在这是为了优先导出顺序，避免报错
// (plugin commonjs--resolver) Error: File not processed yet, /Users/wing/ParacraftDevelop/lexical-vue2/packages/lexical-vue2/src/nodes/ImageNodeVue.vue
export * from './nodes/ImageNodeVue.vue'

export * from './components'

export * from './composables'

export * from './nodes'

// export * as useSplashMenuPlugin from './composables/useSlashMenuPlugin'
// export * as useDropdownMenu from './composables/useDropdownMenu'
// export * as useTabIndentationPlugin from './composables/useTabIndentationPlugin'
