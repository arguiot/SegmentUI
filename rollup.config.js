import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/segment.js',
    output: {
        file: 'dist/segment.js',
        format: 'umd',
        name: 'Segment'
    },
    intro: '/* Copyright © 2019 Arthur Guiot */',
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        })
    ]
};