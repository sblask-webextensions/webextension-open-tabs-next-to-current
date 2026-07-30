import globals from "globals";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        ignores: [
            "dist-*/",
        ],
    },
    stylistic.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es6,
                ...globals.jquery,
                ...globals.webextensions,
            },
            parserOptions: {
                ecmaVersion: 2024,
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-restricted-syntax": [
                "error",
                "ForInStatement",
                {
                    selector: "AwaitExpression:not(:function AwaitExpression)",
                    message: "Top-level await is disallowed in service workers.",
                },
            ],
            "no-unused-vars": [
                "error",
                {
                    args: "all",
                    argsIgnorePattern: "^_[^_]",
                    caughtErrorsIgnorePattern: "^_[^_]",
                    varsIgnorePattern: "^_[^_]",
                },
            ],
            "no-var": "error",
            "prefer-const": "error",
            "@stylistic/array-bracket-newline": [
                "error",
                "consistent",
            ],
            "@stylistic/arrow-parens": [
                "error",
                "always",
            ],
            "@stylistic/brace-style": [
                "error",
                "1tbs",
                {
                    allowSingleLine: true,
                },
            ],
            "@stylistic/comma-dangle": [
                "error",
                {
                    arrays: "always-multiline",
                    exports: "always-multiline",
                    functions: "only-multiline",
                    imports: "always-multiline",
                    objects: "always-multiline",
                },
            ],
            "@stylistic/indent": [
                "error",
                4,
                {
                    SwitchCase: 1,
                },
            ],
            "@stylistic/indent-binary-ops": [
                "error",
                4,
            ],
            "@stylistic/key-spacing": [
                "error",
                {
                    mode: "minimum",
                },
            ],
            "@stylistic/linebreak-style": [
                "error",
                "unix",
            ],
            "@stylistic/max-statements-per-line": [
                "error",
                {
                    max: 2,
                },
            ],
            "@stylistic/no-mixed-operators": [
                "off",
            ],
            "@stylistic/no-multi-spaces": [
                "error",
                {
                    exceptions: {
                        ArrowFunctionExpression: true,
                        BinaryExpression: true,
                        Property: true,
                        VariableDeclarator: true,
                    },
                },
            ],
            "@stylistic/object-curly-spacing": [
                "error",
                "never",
            ],
            "@stylistic/quotes": [
                "error",
                "double",
                {
                    allowTemplateLiterals: "always",
                },
            ],
            "@stylistic/semi": [
                "error",
                "always",
            ],
            "@stylistic/space-before-function-paren": [
                "error",
                {
                    anonymous: "never",
                    asyncArrow: "always",
                    named: "never",
                },
            ],
            "@stylistic/space-infix-ops": "off",
        },
    },
];
