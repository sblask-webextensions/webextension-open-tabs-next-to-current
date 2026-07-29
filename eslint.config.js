import globals from "globals";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        ignores: [
            "dist-*/",
        ],
    },
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
        plugins: {
            stylistic: stylistic,
        },
        rules:{
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
                    "args": "all",
                    "argsIgnorePattern": "^_[^_]",
                    "caughtErrorsIgnorePattern": "^_[^_]",
                    "varsIgnorePattern": "^_[^_]",
                },
            ],
            "no-var": "error",
            "prefer-const": "error",
            "stylistic/array-bracket-newline": [
                "error",
                "consistent",
            ],
            "stylistic/array-bracket-spacing": [
                "error",
                "never",
            ],
            "stylistic/comma-dangle": [
                "error",
                {
                    "arrays": "always-multiline",
                    "exports": "always-multiline",
                    "functions": "only-multiline",
                    "imports": "always-multiline",
                    "objects": "always-multiline",
                },
            ],
            "stylistic/indent": [
                "error",
                4,
                {
                    "SwitchCase": 1,
                },
            ],
            "stylistic/linebreak-style": [
                "error",
                "unix",
            ],
            "stylistic/no-console": [
                "off",
            ],
            "stylistic/object-curly-spacing": [
                "error",
                "never",
            ],
            "stylistic/quotes": [
                "error",
                "double",
            ],
            "stylistic/semi": [
                "error",
                "always",
            ],
        },
    },
];
