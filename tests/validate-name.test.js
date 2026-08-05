'use strict';

const {
  validateProjectName,
  validateRouteName,
} = require('../src/utils/validateName');

describe('validateProjectName', () => {
  it.each(['my-app', 'app_1', 'App.v2'])('accepts %s', (name) => {
    expect(validateProjectName(name)).toBe(name);
  });

  it.each([
    '../evil',
    '/etc/passwd',
    'a/b',
    '..',
    '.',
    '',
    'a;rm -rf /',
    '-flag',
  ])('rejects %s', (name) => {
    expect(() => validateProjectName(name)).toThrow(/Invalid project name/);
  });
});

describe('validateRouteName', () => {
  it.each(['users', 'userProfiles', 'v2_items'])('accepts %s', (name) => {
    expect(validateRouteName(name)).toBe(name);
  });

  // Route names are interpolated into generated JS, so anything that is not a
  // plain identifier is either injection or a syntax error.
  it.each(['../evil', 'a/b', 'my-route', '1users', "x'); require('fs", ''])(
    'rejects %s',
    (name) => {
      expect(() => validateRouteName(name)).toThrow(/Invalid route name/);
    },
  );
});
