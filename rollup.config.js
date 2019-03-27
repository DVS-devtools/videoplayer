import path from 'path';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import ignore from 'rollup-plugin-ignore';
import copy from 'rollup-plugin-copy';
import { builtinModules } from 'module';

const srcDir = path.resolve(__dirname, 'src');
const distDir = path.resolve(__dirname, 'dist');

const paths = {
    entry: path.join(srcDir, 'index.js'),
    browserEntry: path.join(srcDir, 'index.browser.js'),
    distDir,
};

const plugins = [
    babel({
        exclude: 'node_modules/**'
    }),
    ignore([
        ...builtinModules,
        // 'debug',
    ]),
    nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
        preferBuiltins: false,
    }),
    commonjs({
        exclude: ['node_modules/debug/**'],
    }),
];

export default [
    {
        input: paths.browserEntry,
        output: [
            {
                file: path.join(paths.distDir, 'browser.js'),
                format: 'iife',
                name: 'VideoPlayer',
            },
        ],
        plugins: [
            ...plugins,
            terser(),
        ],
    },
    {
        input: paths.entry,
        output: [
            {
                file: path.join(paths.distDir, 'index.js'),
                format: 'cjs',
                name: 'VideoPlayer',
                sourcemap: true,
            },
            {
                file: path.join(paths.distDir, 'index.es.js'),
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            ...plugins,
            copy({
                [path.join(srcDir, 'index.d.ts')]: path.join(distDir, 'index.d.ts'),
            })
        ]
    }
];
