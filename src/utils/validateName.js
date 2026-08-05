'use strict';

// Project names land in a filesystem path; route names are also interpolated
// into generated JS source, so they must be valid identifiers.
const PROJECT_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const ROUTE_NAME = /^[a-zA-Z][a-zA-Z0-9_]*$/;

function validateProjectName(name) {
  if (!PROJECT_NAME.test(name) || name === '.' || name === '..') {
    throw new Error(
      `Invalid project name "${name}": use letters, digits, dot, dash or underscore, starting with a letter or digit.`,
    );
  }
  return name;
}

function validateRouteName(name) {
  if (!ROUTE_NAME.test(name)) {
    throw new Error(
      `Invalid route name "${name}": use letters, digits and underscore, starting with a letter.`,
    );
  }
  return name;
}

module.exports = { validateProjectName, validateRouteName };
