import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
import { defineConfig } from 'rollup';
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default defineConfig([{
    input: './index.ts',
    output: {// for esm publish
        file: pkg.module,
        // format: 'es',
        name: pkg.name,
    },
    plugins: [
        del({ targets: ['./dist'], }),
        typescript({
            tsconfig: './tsconfig.json',
        }),
        // for tappable
        nodeResolve(),
        commonjs(),
        terser(),
    ],
}, {// for umd publish
    input: './index.ts',
    output: {
        file: pkg.main,
        format: 'umd',
        name: pkg.name,
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
        }),
        nodeResolve(),
        commonjs(),
        terser(),
    ],
}]);