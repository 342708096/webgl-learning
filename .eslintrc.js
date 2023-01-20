module.exports = {
  root: true,
  extends: [
    'react-app',
    'react-app/jest',
    'airbnb',
    'airbnb-typescript',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    "no-bitwise": "off",
    "class-methods-use-this": "off",
    "no-plusplus": "off",
    "no-param-reassign": "off",
    "import/no-cycle": "off",
    "semi": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/semi": "off",
    'max-len': ['error', { code: 160 }],
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': 'off',
    'react/function-component-definition': [
      2,
      {
        namedComponents: ['arrow-function', 'function-declaration'],
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
  },
  ignorePatterns: ['.stylelintrc.js', 'www', 'es', 'lib', 'dist', 'build', 'rollup.config.js'],
};
