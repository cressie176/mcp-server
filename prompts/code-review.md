Perform a code review using the following process:

1. Fetch the latest @code-standards
2. Attempt to determine the language based on artifacts in the root project directory, e.g. package.json indicates TypeScript or JavaScript
  - Exclude code in dependency or generated folders like 'node_modules' and 'dist'
3. Review the specified code using ONLY the @code-standards
3. Provide specific, actionable feedback for violations of the @code-standards. NEVER volunteer other feedback.
4. Reference file:line for issues
5. Suggest concrete improvements
