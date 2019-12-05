import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import nodeGlobals from 'rollup-plugin-node-globals';
import { terser } from 'rollup-plugin-terser';
import strip from 'rollup-plugin-strip';
import shim from 'rollup-plugin-shim';
import copy from 'rollup-plugin-copy';

function onwarn(warning) {
    throw Error(typeof warning === 'string' ? warning : warning.message);
}

const input = 'src/index.browser.js';

const extensions = ['.js', '.jsx'];

const commonPlugins = [

    babel({
        extensions,
        exclude: /node_modules/,
        runtimeHelpers: true,
        configFile: path.resolve(process.cwd(), 'babel.config.js'),
    }),
    strip({
        functions: ['debug'],
    }),
    shim({
        debug: 'export default function debug() { return function() { return undefined; }; }',
    }),
    nodeResolve({ extensions }),
    commonjs({
        ignoreGlobal: true,
        include: /node_modules/,
        exclude: ['node_modules/debug/**'],
    }),
    nodeGlobals(),
];

export default [
    {
        input,
        onwarn,
        output: {
            format: 'umd',
            file: 'umd/index.js',
            name: 'VideoPlayer',
        },
        plugins: [
            ...commonPlugins,
            replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
        ],
    },
    {
        input,
        onwarn,
        output: {
            format: 'umd',
            file: 'umd/index.min.js',
            name: 'VideoPlayer',
        },
        plugins: [
            ...commonPlugins,
            replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
            terser(),
            copy({
                targets: [
                    {
                        src: path.resolve(__dirname, 'src/index.d.ts'),
                        dest: path.resolve(__dirname, 'dist'),
                    },
                ],
            })
        ],
    },
];
