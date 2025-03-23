import tsEslint from "typescript-eslint"

export default tsEslint.config({
  files: ["src/**/*.ts"],
  languageOptions: {
    parser: tsEslint.parser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: "./tsconfig.json"
    }
  },
  
})
