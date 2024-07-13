import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    ...compat.extends("plugin:vue/vue3-recommended", "@vue/eslint-config-typescript"),
    {
        rules: {
            "vue/max-attributes-per-line": "off",
            "vue/first-attribute-linebreak": "off",
            "vue/html-closing-bracket-newline": "off",
            "vue/singleline-html-element-content-newline": "off",
            quotes: ["error", "single"],
        },
        files: ["src/**/*.js", "src/**/*.vue", "src/**/*.ts"]
    },
];