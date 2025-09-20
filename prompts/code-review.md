Perform a code review using the following process:

1. Fetch the latest @code-standards
2. Attempt to determine the language based on artifacts in the root project directory, e.g. package.json indicates TypeScript or JavaScript
  - Exclude code in dependency or generated folders like 'node_modules' and 'dist'
3. Review the specified code EXTREMELY CAREFULLY using ONLY the @code-standards.
4. Provide specific, actionable feedback for violations of the @code-standards.
  - NEVER volunteer feedback that is not based on the #code-standards.
  - Avoid flagging false positives. It is better to say nothing than undermine the review with bad feedback.
6. Reference file:line for issues
7. Reference the violation
8. Suggest concrete improvements
