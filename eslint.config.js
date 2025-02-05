const jsdoc = require('eslint-plugin-jsdoc');
const globals = require('globals');
const js = require('@eslint/js');

module.exports = [js.configs.recommended, {
    plugins: {
        jsdoc,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            BigInt: "readable",
        },

        ecmaVersion: 2019,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                impliedStrict: true,
            },
        },
    },

    settings: {
        jsdoc: {
            tagNamePreference: {
                constructor: "constructor",
                emits: "emits",
                extends: "extends",
                method: "method",
                returns: "return",
            },
        },
    },

    rules: {
        "no-async-promise-executor": 2,
        "no-await-in-loop": 2,
        "no-console": 0,

        "no-extra-parens": [2, "all", {
            nestedBinaryExpressions: false,
            enforceForArrowConditionals: false,
        }],

        "no-misleading-character-class": 2,
        "no-prototype-builtins": 2,
        "no-template-curly-in-string": 0,
        "require-atomic-updates": 2,
        "accessor-pairs": 2,
        "array-callback-return": 2,
        "block-scoped-var": 2,
        "class-methods-use-this": 2,
        complexity: 0,
        "consistent-return": 2,
        curly: 2,
        "default-case": 2,
        "dot-location": [2, "property"],
        "dot-notation": 2,
        eqeqeq: 2,
        "guard-for-in": 2,
        "max-classes-per-file": 1,
        "no-alert": 2,
        "no-caller": 2,
        "no-div-regex": 2,
        "no-else-return": 2,
        "no-empty-function": 2,
        "no-eq-null": 2,
        "no-eval": 2,
        "no-extend-native": 2,
        "no-extra-bind": 2,
        "no-extra-label": 2,
        "no-floating-decimal": 2,
        "no-implicit-coercion": 2,
        "no-implicit-globals": 2,
        "no-implied-eval": 2,
        "no-invalid-this": 2,
        "no-iterator": 2,
        "no-labels": 2,
        "no-lone-blocks": 2,
        "no-loop-func": 2,

        "no-magic-numbers": [1, {
            ignore: [-1, 0, 1],
            detectObjects: true,
        }],

        "no-multi-spaces": [2, {
            exceptions: {
                VariableDeclarator: true,
                Property: true,
            },
        }],

        "no-multi-str": 2,
        "no-new": 2,
        "no-new-func": 2,
        "no-new-wrappers": 2,
        "no-octal-escape": 2,
        "no-native-reassign": 2,
        "no-proto": 2,
        "no-return-assign": [2, "always"],
        "no-return-await": 1,
        "no-script-url": 2,
        "no-self-compare": 2,
        "no-sequences": 2,
        "no-throw-literal": 2,
        "no-unmodified-loop-condition": 2,
        "no-unused-expressions": 2,
        "no-useless-call": 2,
        "no-useless-catch": 2,
        "no-useless-concat": 2,
        "no-useless-return": 2,
        "no-void": 2,
        "no-warning-comments": 1,
        "no-with": 2,
        "prefer-named-capture-group": 2,
        "prefer-promise-reject-errors": 2,
        radix: 2,
        "require-await": 2,
        "require-unicode-regexp": 0,
        "vars-on-top": 0,
        "wrap-iife": [2, "inside"],
        yoda: 2,
        strict: [2, "safe"],
        "init-declarations": 0,
        "no-label-var": 2,
        "no-restricted-globals": [2, "event"],
        "no-shadow": 1,
        "no-shadow-restricted-names": 2,

        "no-undef": [2, {
            typeof: true,
        }],

        "no-undef-init": 2,
        "no-undefined": 2,
        "no-use-before-define": [2, "nofunc"],
        "global-require": 2,
        "handle-callback-err": 1,
        "no-buffer-constructor": 2,

        "no-mixed-requires": [2, {
            grouping: true,
            allowCall: true,
        }],

        "no-new-require": 2,
        "no-path-concat": 2,
        "no-process-env": 0,
        "no-process-exit": 2,
        "no-restricted-imports": [2, "domain", "freelist", "smalloc", "sys", "colors"],
        "no-restricted-modules": [2, "domain", "freelist", "smalloc", "sys", "colors"],
        "no-sync": 0,

        "array-bracket-newline": [2, {
            multiline: true,
            minItems: 5,
        }],

        "array-bracket-spacing": [2, "never"],

        "array-element-newline": [2, {
            multiline: true,
            minItems: 5,
        }],

        "block-spacing": 2,

        "brace-style": [2, "stroustrup", {
            allowSingleLine: false,
        }],

        camelcase: [2, {
            properties: "never",
        }],

        "capitalized-comments": 2,
        "comma-dangle": [2, "never"],

        "comma-spacing": [2, {
            before: false,
            after: true,
        }],

        "comma-style": [2, "last"],
        "computed-property-spacing": [2, "never"],
        "consistent-this": 2,
        "eol-last": 2,
        "func-call-spacing": [2, "never"],
        "func-name-matching": 2,
        "func-names": [2, "as-needed"],
        "func-style": 0,
        "function-paren-newline": [2, "multiline"],
        "implicit-arrow-linebreak": [2, "beside"],

        indent: [2, "tab", {
            SwitchCase: 1,
        }],

        "jsx-quotes": 2,

        "key-spacing": [2, {
            align: "colon",
            beforeColon: false,
            afterColon: true,
        }],

        "keyword-spacing": 2,
        "linebreak-style": [2, "unix"],

        "lines-between-class-members": [2, "always", {
            exceptAfterSingleLine: true,
        }],

        "max-depth": [1, 4],

        "max-lines-per-function": [2, {
            max: 70,
            skipBlankLines: true,
            skipComments: true,
        }],

        "max-nested-callbacks": [1, 4],
        "max-params": [1, 4],
        "max-statements-per-line": 2,
        "multiline-comment-style": [2, "starred-block"],
        "multiline-ternary": [2, "always-multiline"],

        "new-cap": [2, {
            newIsCap: true,
            capIsNew: true,
            capIsNewExceptions: ["BigInt"],
        }],

        "new-parens": 2,
        "newline-per-chained-call": 2,
        "no-array-constructor": 2,
        "no-lonely-if": 2,

        "no-mixed-operators": [2, {
            allowSamePrecedence: true,
        }],

        "no-mixed-spaces-and-tabs": 2,

        "no-multiple-empty-lines": [2, {
            max: 1,
        }],

        "no-negated-condition": 2,
        "no-nested-ternary": 1,
        "no-new-object": 2,
        "no-restricted-syntax": [2, "WithStatement"],
        "no-trailing-spaces": 2,
        "no-underscore-dangle": 1,
        "no-unneeded-ternary": 2,
        "no-whitespace-before-property": 2,
        "nonblock-statement-body-position": [2, "beside"],

        "object-curly-newline": [2, {
            multiline: true,
        }],

        "object-curly-spacing": [2, "never"],

        "object-property-newline": [2, {
            allowAllPropertiesOnSameLine: true,
        }],

        "one-var": [2, "never"],
        "one-var-declaration-per-line": 2,
        "operator-assignment": [2, "always"],

        "operator-linebreak": [2, "before", {
            overrides: {
                ",": "after",
            },
        }],

        "padded-blocks": [2, "never"],
        "quote-props": [2, "consistent-as-needed"],

        quotes: [2, "single", {
            avoidEscape: true,
        }],

        semi: [2, "always"],

        "semi-spacing": [2, {
            before: false,
            after: true,
        }],

        "semi-style": [2, "last"],
        "space-before-blocks": [2, "always"],

        "space-before-function-paren": [2, {
            anonymous: "always",
            named: "always",
        }],

        "space-in-parens": [2, "never"],
        "space-infix-ops": 2,
        "space-unary-ops": 2,

        "spaced-comment": [2, "always", {
            markers: ["!"],
        }],

        "switch-colon-spacing": 2,
        "template-tag-spacing": 2,
        "unicode-bom": 2,
        "arrow-body-style": [2, "as-needed"],
        "arrow-parens": [2, "as-needed"],

        "arrow-spacing": [2, {
            before: true,
            after: true,
        }],

        "generator-star-spacing": [2, "both"],
        "no-confusing-arrow": 2,

        "no-duplicate-imports": [2, {
            includeExports: true,
        }],

        "no-useless-computed-key": 2,
        "no-useless-constructor": 2,
        "no-useless-rename": 2,
        "object-shorthand": 1,
        "prefer-const": 1,
        "prefer-numeric-literals": 2,
        "prefer-rest-params": 1,
        "prefer-template": 2,
        "rest-spread-spacing": [2, "never"],
        "symbol-description": 1,
        "template-curly-spacing": 2,
        "yield-star-spacing": [2, "both"],
        "jsdoc/check-alignment": 1,
        "jsdoc/check-indentation": 1,
        "jsdoc/check-param-names": 1,
        "jsdoc/check-syntax": 0,
        "jsdoc/check-tag-names": 1,
        "jsdoc/check-types": 1,
        "jsdoc/implements-on-classes": 1,
        "jsdoc/match-description": 1,
        "jsdoc/no-types": 0,
        "jsdoc/no-undefined-types": 0,
        "jsdoc/require-description": 0,
        "jsdoc/require-description-complete-sentence": 0,
        "jsdoc/require-example": 0,
        "jsdoc/require-hyphen-before-param-description": 0,
        "jsdoc/require-jsdoc": 1,
        "jsdoc/require-param": 1,
        "jsdoc/require-param-description": 0,
        "jsdoc/require-param-name": 1,
        "jsdoc/require-param-type": 1,
        "jsdoc/require-returns": 0,
        "jsdoc/require-returns-check": 1,
        "jsdoc/require-returns-description": 0,
        "jsdoc/require-returns-type": 1,
        "jsdoc/valid-types": 1,
    },
}];