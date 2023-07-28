import vue from 'rollup-plugin-vue';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'esm',
        name: 'MyVueApp',
        sourcemap: true,
    },
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
};
