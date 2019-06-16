module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: 'module',
		ecmaFeatures: {
			impliedStrict: true
		}
	},
	env: {
		node: true,
		es6: true
	},
	plugins: [
		'jsdoc'
	],
	extends: 'eslint:recommended',
	globals: {
		'BigInt': 'readable'
	},
	rules: {
		// Possible Errors
		// 'for-direction': 2, // inherited
		// 'getter-return': 2,
		'no-async-promise-executor': 2,
		'no-await-in-loop': 2,
		// 'no-compare-neg-zero': 2, // inherited
		// 'no-cond-assign': 2,
		'no-console': 0,
		// 'no-constant-condition': 2, // inherited
		// 'no-control-regex': 2,
		// 'no-debugger': 2,
		// 'no-dupe-args': 2,
		// 'no-dupe-keys': 2,
		// 'no-duplicate-case': 2,
		// 'no-empty': 2,
		// 'no-empty-character-class': 2,
		// 'no-ex-assign': 2,
		// 'no-extra-boolean-cast': 2,
		// disabled because of https://github.com/eslint/eslint/issues/3065
		// 'no-extra-parens': 2,
		'no-extra-parens': [2, 'all', {
			// conditionalAssign: true,
			// returnAssign: true,
			nestedBinaryExpressions: false,
			// ignoreJSX: 'none',
			enforceForArrowConditionals: false
		}],
		// 'no-extra-semi': 2, // inherited
		// 'no-func-assign': 2,
		// 'no-inner-declarations': 2,
		// 'no-invalid-regexp': 2,
		// 'no-irregular-whitespace': 2,
		'no-misleading-character-class': 2,
		// 'no-obj-calls': 2, // inherited
		'no-prototype-builtins': 2,
		// 'no-regex-spaces': 2, // inherited
		// 'no-sparse-arrays': 2,
		'no-template-curly-in-string': 0,
		// 'no-unexpected-multiline': 2, // inherited
		// 'no-unreachable': 2,
		// 'no-unsafe-finally': 2,
		// 'no-unsafe-negation': 2,
		'require-atomic-updates': 2,
		// 'use-isnan': 2, // inherited
		// 'valid-typeof': 2,

		// Best Practices
		'accessor-pairs': 2,
		'array-callback-return': 2,
		'block-scoped-var': 2,
		'class-methods-use-this': 2,
		'complexity': 0,
		'consistent-return': 2,
		'curly': 2,
		'default-case': 2,
		'dot-location': [2, 'property'],
		'dot-notation': 2,
		'eqeqeq': 2,
		'guard-for-in': 2,
		'max-classes-per-file': 1,
		'no-alert': 2,
		'no-caller': 2,
		// 'no-case-declarations': 2, // inherited
		'no-div-regex': 2,
		'no-else-return': 2,
		'no-empty-function': 2,
		// 'no-empty-pattern': 2, // inherited
		'no-eq-null': 2,
		'no-eval': 2,
		'no-extend-native': 2,
		'no-extra-bind': 2,
		'no-extra-label': 2,
		// 'no-fallthrough': 2, // inherited
		'no-floating-decimal': 2,
		// 'no-global-assign': 2, // inherited
		'no-implicit-coercion': 2,
		'no-implicit-globals': 2,
		'no-implied-eval': 2,
		'no-invalid-this': 2,
		'no-iterator': 2,
		'no-labels': 2,
		'no-lone-blocks': 2,
		'no-loop-func': 2,
		'no-magic-numbers': [1, {ignore: [-1, 0, 1], detectObjects: true}],
		'no-multi-spaces': [2, {
			exceptions: {
				'VariableDeclarator': true,
				'Property': true
			}
		}],
		'no-multi-str': 2,
		'no-new': 2,
		'no-new-func': 2,
		'no-new-wrappers': 2,
		// 'no-octal': 2, // inherited
		'no-octal-escape': 2,
		'no-native-reassign': 2,
		'no-proto': 2,
		// 'no-redeclare': 2, // inherited
		// 'no-restricted-properties': [2, {object: 'objectName', property: 'propertyName'}]
		'no-return-assign': [2, 'always'],
		'no-return-await': 1,
		'no-script-url': 2,
		// 'no-self-assign': 2, // inherited
		'no-self-compare': 2,
		'no-sequences': 2,
		'no-throw-literal': 2,
		'no-unmodified-loop-condition': 2,
		'no-unused-expressions': 2,
		// 'no-unused-labels': 2, // inherited
		'no-useless-call': 2,
		'no-useless-catch': 2,
		'no-useless-concat': 2,
		// 'no-useless-escape': 2, // inherited
		'no-useless-return': 2,
		'no-void': 2,
		'no-warning-comments': 1,
		'no-with': 2,
		'prefer-named-capture-group': 2,
		'prefer-promise-reject-errors': 2,
		'radix': 2,
		'require-await': 2,
		'require-unicode-regexp': 0,
		'vars-on-top': 0,
		'wrap-iife': [2, 'inside'],
		'yoda': 2,

		// Strict Mode
		'strict': [2, 'safe'],

		// Variables
		'init-declarations': 0,
		// 'no-delete-var': 2, // inherited
		'no-label-var': 2,
		'no-restricted-globals': [2, 'event'],
		'no-shadow': 1,
		'no-shadow-restricted-names': 2,
		'no-undef': [2, {typeof: true}],
		'no-undef-init': 2,
		'no-undefined': 2,
		// 'no-unused-vars': 2, // inherited
		'no-use-before-define': [2, 'nofunc'],

		// Node.js
		// disabled because of https://github.com/eslint/eslint/issues/3420
		// 'callback-return': [1, ['cb', 'callback', 'next', 'done']],
		'global-require': 2,
		'handle-callback-err': 1,
		'no-buffer-constructor': 2,
		'no-mixed-requires': [2, {grouping: true, allowCall: true}],
		'no-new-require': 2,
		'no-path-concat': 2,
		'no-process-env': 0,
		'no-process-exit': 2,
		'no-restricted-imports': [2, 'domain', 'freelist', 'smalloc', 'sys', 'colors'],
		'no-restricted-modules': [2, 'domain', 'freelist', 'smalloc', 'sys', 'colors'],
		'no-sync': 0,

		// Stylistic Issues
		'array-bracket-newline': [2, {multiline: true, minItems: 5}],
		'array-bracket-spacing': [2, 'never'],
		'array-element-newline': [2, {multiline: true, minItems: 5}],
		'block-spacing': 2,
		'brace-style': [2, 'stroustrup', {allowSingleLine: false}],
		'camelcase': [2, {properties: 'never'}],
		'capitalized-comments': 2,
		'comma-dangle': [2, 'never'],
		'comma-spacing': [2, {before: false, after: true}],
		'comma-style': [2, 'last'],
		'computed-property-spacing': [2, 'never'],
		'consistent-this': 2,
		'eol-last': 2,
		'func-call-spacing': [2, 'never'],
		'func-name-matching': 2,
		'func-names': [2, 'as-needed'],
		'func-style': 0,
		'function-paren-newline': [2, 'multiline'],
		// 'id-blacklist': ['cb', 'callback'],
		// 'id-length': [2, {min: 3}],
		// 'id-match': [2, '^[a-z]+([A-Z][a-z]+)*$'],
		'implicit-arrow-linebreak': [2, 'beside'],
		'indent': [2, 'tab', {SwitchCase: 1}],
		'jsx-quotes': 2,
		'key-spacing': [2, {align: 'colon', beforeColon: false, afterColon: true}],
		'keyword-spacing': 2,
		'linebreak-style': [2, 'unix'],
		// 'line-comment-position': [2, 'above'],
		'lines-between-class-members': [2, 'always', {exceptAfterSingleLine: true}],
		'max-depth': [1, 4],
		// 'max-lines': [2, 300],
		'max-lines-per-function': [2, {max: 70, skipBlankLines: true, skipComments: true}],
		'max-nested-callbacks': [1, 4],
		'max-params': [1, 4],
		// 'max-statements': [2, 30],
		'max-statements-per-line': 2,
		'multiline-comment-style': [2, 'starred-block'],
		'multiline-ternary': [2, 'always-multiline'],
		'new-cap': [2, {newIsCap: true, capIsNew: true, capIsNewExceptions: ['BigInt']}],
		'new-parens': 2,
		'newline-per-chained-call': 2,
		'no-array-constructor': 2,
		// 'no-bitwise': 0,
		// 'no-continue': 0,
		// 'no-inline-comments': 0,
		'no-lonely-if': 2,
		'no-mixed-operators': [2, {allowSamePrecedence: true}],
		'no-mixed-spaces-and-tabs': 2,
		// 'no-multi-assign': 0,
		'no-multiple-empty-lines': [2, {max: 1}],
		'no-negated-condition': 2,
		'no-nested-ternary': 1,
		'no-new-object': 2,
		// 'no-plusplus': 0,
		'no-restricted-syntax': [2, 'WithStatement'],
		// 'no-tabs': 0,
		// 'no-ternary': 0,
		'no-trailing-spaces': 2,
		'no-underscore-dangle': 1,
		'no-unneeded-ternary': 2,
		'no-whitespace-before-property': 2,
		'nonblock-statement-body-position': [2, 'beside'],
		'object-curly-newline': [2, {multiline: true}],
		'object-curly-spacing': [2, 'never'],
		'object-property-newline': [2, {allowAllPropertiesOnSameLine: true}],
		'one-var': [2, 'never'],
		'one-var-declaration-per-line': 2,
		'operator-assignment': [2, 'always'],
		'operator-linebreak': [2, 'before', {overrides: {',': 'after'}}],
		'padded-blocks': [2, 'never'],
		// 'padding-line-between-statements': 0,
		// 'prefer-object-spread': 0,
		'quote-props': [2, 'consistent-as-needed'],
		// disabled because of https://github.com/eslint/eslint/issues/5234
		'quotes': [2, 'single', {avoidEscape: true}],
		'semi': [2, 'always'],
		'semi-spacing': [2, {before: false, after: true}],
		'semi-style': [2, 'last'],
		// 'sort-keys': 0,
		// 'sort-vars': 0,
		'space-before-blocks': [2, 'always'],
		'space-before-function-paren': [2, {anonymous: 'always', named: 'always'}],
		'space-in-parens': [2, 'never'],
		'space-infix-ops': 2,
		'space-unary-ops': 2,
		'spaced-comment': [2, 'always', {markers: ['!']}],
		'switch-colon-spacing': 2,
		'template-tag-spacing': 2,
		'unicode-bom': 2,
		// 'wrap-regex': 0

		// ES2015
		'arrow-body-style': [2, 'as-needed'],
		'arrow-parens': [2, 'as-needed'],
		'arrow-spacing': [2, {before: true, after: true}],
		// 'constructor-super': 2, // inherited
		'generator-star-spacing': [2, 'both'],
		// 'no-class-assign': 2, // inherited
		'no-confusing-arrow': 2,
		// 'no-const-assign': 2, // inherited
		// 'no-dupe-class-members': 2,
		'no-duplicate-imports': [2, {includeExports: true}],
		// 'no-new-symbol': 2, // inherited
		// 'no-restricted-imports': [2, 'moduleName'],
		// 'no-this-before-super': 2, inherited
		'no-useless-computed-key': 2,
		'no-useless-constructor': 2,
		'no-useless-rename': 2,
		// 'no-var': 0,
		'object-shorthand': 1,
		// 'prefer-arrow-callback': 0,
		'prefer-const': 1,
		// 'prefer-destructuring': 0,
		'prefer-numeric-literals': 2,
		'prefer-rest-params': 1,
		// 'prefer-spread': 0,
		'prefer-template': 2,
		// 'require-yield': 2, // inherited
		'rest-spread-spacing': [2, 'never'],
		// 'sort-imports': 0,
		'symbol-description': 1,
		'template-curly-spacing': 2,
		'yield-star-spacing': [2, 'both'],

		// JSDoc
		'jsdoc/check-alignment': 1,
		'jsdoc/check-examples': 1,
		'jsdoc/check-indentation': 1,
		'jsdoc/check-param-names': 1,
		'jsdoc/check-syntax': 0,
		'jsdoc/check-tag-names': 1,
		'jsdoc/check-types': 1,
		'jsdoc/implements-on-classes': 1,
		'jsdoc/match-description': 1,
		'jsdoc/newline-after-description': 1,
		'jsdoc/no-types': 0,
		'jsdoc/no-undefined-types': 0,
		'jsdoc/require-description': 0,
		'jsdoc/require-description-complete-sentence': 0,
		'jsdoc/require-example': 0,
		'jsdoc/require-hyphen-before-param-description': 0,
		'jsdoc/require-jsdoc': 1,
		'jsdoc/require-param': 1,
		'jsdoc/require-param-description': 0,
		'jsdoc/require-param-name': 1,
		'jsdoc/require-param-type': 1,
		'jsdoc/require-returns': 0,
		'jsdoc/require-returns-check': 1,
		'jsdoc/require-returns-description': 0,
		'jsdoc/require-returns-type': 1,
		'jsdoc/valid-types': 1
	},
	settings: {
		jsdoc: {
			tagNamePreference: {
				constructor: 'constructor',
				emits: 'emits',
				extends: 'extends',
				method: 'method',
				returns: 'return'
			}
		}
	}
};
