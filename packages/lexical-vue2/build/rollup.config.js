import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [
        {
          file: 'dist/bundle.js',
          format: 'umd',
          name: 'lexical-vue2',
          globals: {
            vue: 'Vue'
          }
        },
        {
          file: 'dist/bundle.esm.js',
          format: 'esm',
          globals: {
            vue: 'Vue'
          }
        }
      ],
    plugins: [
        resolve({
            extensions: ['.js', '.vue'],
        }),
        commonjs(),
        vue({
            css: true,
            compileTemplate: true,
        }),
    ],
    external: [
        'vue',
        '@vue/composition-api',
        '@lexical/clipboard',
        '@lexical/dragon',
        '@lexical/rich-text',
        '@lexical/text',
        '@lexical/utils',
        'lexical'
    ]
};
