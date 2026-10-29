/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const path = require('path');
module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  roots: ['<rootDir>/jest/__tests__'],
  testMatch: ['<rootDir>/jest/__tests__/*-test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/oh_modules/', '/harmony/'],
  testEnvironment: 'node',
  globals: {__DEV__: true},
  transform: {'^.+\\.[jt]sx?$': ['babel-jest', {
    configFile: false, babelrc: false,
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], ['@babel/preset-typescript', {allExtensions: true, isTSX: true}]],
  }]},
  transformIgnorePatterns: ['node_modules/(?!react-native|@react-native|react)'],
  collectCoverageFrom: ['src/index.tsx'],
  coverageDirectory: '<rootDir>/jest/coverage',
  coverageThreshold: {global: {lines: 81, branches: 60}},
};

