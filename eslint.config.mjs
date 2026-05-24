import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'coverage/**'],
  },
  ...compat.extends('next/core-web-vitals'),
];
