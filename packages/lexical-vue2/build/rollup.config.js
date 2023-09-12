import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias'
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.ts',
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
        json(),
        alias({
            entries: [
                {find: /^@\/(.*?)$/, replacement: 'src/$1'},
            ]
        }),
        vue({
            css: true,
            compileTemplate: true,
        }),
        typescript(),
        resolve({
            extensions: ['.js', '.ts', '.vue'],
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**' // 只对我们的源代码进行转换
        })
    ],
    external: [
        'vue',
        '@vue/composition-api',
        '@lexical/clipboard',
        '@lexical/dragon',
        '@lexical/rich-text',
        '@lexical/text',
        '@lexical/utils',
        '@lexical/mark',
        '@lexical/markdown',
        '@lexical/list',
        '@lexical/link',
        '@lexical/history',
        '@lexical/code',
        'lexical'
    ]
};
