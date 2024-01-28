module.exports = {
  default: [
    '--require-module ts-node/register',
    '--require ./tests/step_definitions/**/*.ts',
    'tests/features/**/*.feature',
  ].join(' '),
};
