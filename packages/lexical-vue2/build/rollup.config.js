import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from '@rollup/plugin-typescript';

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
        typescript(),
        resolve({
            extensions: ['.js', '.vue'],
        }),
        commonjs(),
        vue({
            css: true,
            compileTemplate: true,
        }),
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
        'lexical'
    ]
};
