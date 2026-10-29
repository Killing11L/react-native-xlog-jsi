/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const mockInstall = jest.fn();
const mockNativeModules = {XlogJsi: {install: mockInstall}};
const mockPlatform = {select: jest.fn(options => options.default)};

jest.mock('react-native', () => ({
  NativeModules: mockNativeModules,
  Platform: mockPlatform,
}), {virtual: true});

function loadXlog() {
  let Xlog;
  jest.isolateModules(() => { Xlog = require('../../src/index').default; });
  return Xlog;
}

beforeEach(() => {
  delete global.xlogAppenderFlush;
  mockInstall.mockReset();
  mockNativeModules.XlogJsi = {install: mockInstall};
  mockPlatform.select.mockImplementation(options => options.default);
});
afterEach(() => { delete global.xlogAppenderFlush; });

describe('Xlog initialization', () => {
  it('installs with default parameters', () => {
    const Xlog = loadXlog();
    new Xlog();
    expect(mockInstall).toHaveBeenCalledWith('xlogs', 'XLog', 3, true);
    expect(mockInstall).toHaveBeenCalledTimes(1);
  });

  it('forwards custom parameters, including zero and false', () => {
    const Xlog = loadXlog();
    new Xlog('/logs', 'Custom', 0, false);
    expect(mockInstall).toHaveBeenCalledWith('/logs', 'Custom', 0, false);
  });

  it('does not install again when the JSI flush function already exists', () => {
    global.xlogAppenderFlush = jest.fn();
    const Xlog = loadXlog();
    new Xlog();
    expect(mockInstall).not.toHaveBeenCalled();
  });

  it('throws a linking error if the native module is missing', () => {
    mockNativeModules.XlogJsi = undefined;
    const Xlog = loadXlog();
    expect(() => new Xlog()).toThrow("doesn't seem to be linked");
  });

  it('propagates native installation errors', () => {
    const error = new Error('install failed');
    mockInstall.mockImplementation(() => { throw error; });
    expect(() => new (loadXlog())()).toThrow(error);
  });
});

describe('Xlog.appenderFlush', () => {
  it('defaults to synchronous flush and returns the native result', async () => {
    global.xlogAppenderFlush = jest.fn().mockReturnValue(1);
    const Xlog = loadXlog();
    await expect(Xlog.appenderFlush()).resolves.toBe(1);
    expect(global.xlogAppenderFlush).toHaveBeenCalledWith(true);
  });

  it('forwards false for asynchronous flush', async () => {
    global.xlogAppenderFlush = jest.fn().mockReturnValue(1);
    const Xlog = loadXlog();
    await Xlog.appenderFlush(false);
    expect(global.xlogAppenderFlush).toHaveBeenCalledWith(false);
  });

  it('rejects when the native flush function throws', async () => {
    const error = new Error('flush failed');
    global.xlogAppenderFlush = jest.fn(() => { throw error; });
    await expect(loadXlog().appenderFlush()).rejects.toBe(error);
  });

  it('rejects when called before initialization', async () => {
    await expect(loadXlog().appenderFlush()).rejects.toThrow();
  });
});

