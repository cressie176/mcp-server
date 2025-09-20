Perform a code review using the following process:

1. Fetch the latest @code-standards
2. Review the specified code against these standards
  - Attempt to determine the language based on artifacts in the root project directory, e.g. package.json indicates TypeScript or JavaScript
  - Exclude code in node_modules or generated folders like 'dist'
3. Provide specific, actionable feedback
4. Reference file:line for issues
5. Suggest concrete improvements
