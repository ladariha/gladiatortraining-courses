# Project-specific development guidelines

## Build and runtime
- Tooling: TypeScript 4.9.5, React 18, React Router DOM 6.
- Node.js: Use Node 18+ (recommended 20+) to match Vite 6 and Jest 29+ compatibility.
- Development: yarn start starts dev server
- Production build: yarn bundleProd runs build.


## Git
- always start git branch from main, never push to main directly
- always use git push --force-with-lease
- use git commit -m "..." to commit changes
- use git push origin <branch> to push changes
- use git pull origin <branch> to pull changes
- use git checkout -b <branch> to create a new branch
- use git checkout <branch> to switch to an existing branch
- use git rebase <branch> to rebase the current branch on top of another, do not use merge, in case of conflicts abort the rebase and let me know
- use git rebase --abort to abort a rebase
- use git rebase --continue to continue a rebase

## Best Practices for Commits

- **Verify before committing**: Ensure code is linted, builds correctly, and documentation is updated
- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Conventional commit format**: Use the format `<type>: <description>` where type is one of:
    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation changes
    - `style`: Code style changes (formatting, etc)
    - `refactor`: Code changes that neither fix bugs nor add features
    - `perf`: Performance improvements
    - `test`: Adding or fixing tests
    - `chore`: Changes to the build process, tools, etc.
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "add feature" not "added feature")
- **Concise first line**: Keep the first line under 72 characters
- do not use emojis in commit message

## Guidelines for Splitting Commits

When analyzing the diff, consider splitting commits based on these criteria:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different types of changes**: Mixing features, fixes, refactoring, etc.
3. **File patterns**: Changes to different types of files (e.g., source code vs documentation)
4. **Logical grouping**: Changes that would be easier to understand or review separately
5. **Size**: Very large changes that would be clearer if broken down

## Examples

### Good commit messages:
-  feat: add user authentication system
-  fix: resolve memory leak in rendering process
-  docs: update API documentation with new endpoints
-  fix: resolve linter warnings in component files

## Command Options
- `--no-verify`: Skip running the pre-commit checks (lint, build, generate:docs)

## Important Notes
- By default, pre-commit checks (`yarn lint`, `yarn test`, `yarn build`) will run to ensure code quality
- If these checks fail, you'll be asked if you want to proceed with the commit anyway or fix the issues first
- If specific files are already staged, the command will only commit those files
- If no files are staged, it will automatically stage all modified and new files
- The commit message will be constructed based on the changes detected
- Before committing, the command will review the diff to identify if multiple commits would be more appropriate
- If suggesting multiple commits, it will help you stage and commit the changes separately
- Always reviews the commit diff to ensure the message matches the changes

## Creating new component
- do not ever modify file main.tsx, if needed use new components in app.tsx or where else needed
- place new component in src/components/<Component>
- import and export from src/components/<Component>
- always name the component file the same as the component (e.g., src/components/Button/Button.tsx)
- put component styles next to the component in file called styles.css
- if component needs extra files, place them in the same directory as the component (e.g., src/components/Button/useSomeHook.ts)
- if hook seems to have potential to be used in other components, place it into src/hooks folder
- keep component files as small as possible, extract logic to hooks if needed
- always create tests for new components

## TypeScript configuration
- tsconfig.app.json is optimized for bundler mode (moduleResolution: bundler, verbatimModuleSyntax, jsx: react-jsx). This is used for the app build via Vite.
- tsconfig.json is more Jest/Node-friendly (moduleResolution: node, target es5) and is what ts-jest will typically pick up. Keep this split in mind:
  - App code should compile and type-check under both configs.
  - If you add TS path aliases or lib options for app build, mirror any changes needed by Jest into tsconfig.json (or point ts-jest to a custom tsconfig if you add one).
- always specify parameters' types in function signatures and return values

## Linting & code style
- ESLint flat config (eslint.config.js):
  - Base: @eslint/js recommended plus typescript-eslint recommended.
  - React: eslint-plugin-react flat.recommended with react/react-in-jsx-scope and react/jsx-uses-react turned off for React 17+ JSX runtime.
  - Stylistic: @stylistic/eslint-plugin with project-wide conventions (2-space indent, double quotes, semicolons, trailing commas on multiline, 1TBS brace style, etc.).
  - TSX override disables @stylistic/jsx-one-expression-per-line for better ergonomics.
- Commands: yarn lint and yarn lint:fix.
- prefer arrow functions
- prefer async/await
- always cover new code with tests

## Testing
- Framework: Jest 29 with testEnvironment: jsdom via ts-jest transform for .ts/.tsx.
- Setup: src/jest.setup.ts
  - Extends @testing-library/jest-dom matchers.
  - Polyfills TextEncoder/TextDecoder for libraries requiring them in jsdom.
- DOM testing: @testing-library/react, @testing-library/user-event, and a lightweight Page Object pattern.
  - Base page object: src/testutils/BasePageObject.
  - Example page objects under src/pages/**/..pageObject.ts demonstrate selectors and actions.
- put tests next to the component they test
- put page objects next to the component they test
- CSS handling in tests: identity-obj-proxy maps style imports to a proxy object (moduleNameMapper for .css, .less, .sass, .scss), so importing component styles is safe in tests.
- Scripts:
  - yarn test runs Jest once. You can pass flags, e.g., yarn test --coverage or yarn test -- src/pages/Example/Example.spec.tsx.

### Authoring tests
- File conventions: use .spec.tsx for React component tests and .test.ts for utilities.
- Place <Component>.spec.tsx next to the component, import the component, render it, and assert via Testing Library. If the component imports CSS, no extra config is needed due to moduleNameMapper.
- Renderer: prefer @testing-library/react render().
  - For components using routing, you can wrap in a router. The repo contains an example using BrowserRouter from react-router; for unit tests, MemoryRouter from react-router-dom is usually preferable.
- Page Object pattern: create a <Component>PageObject extending BasePageObject to encapsulate selectors and actions. This keeps specs concise and reduces selector duplication.
- Async assertions: use waitFor for state updates and user-event for interactions.

### Running tests locally (verified)
- Baseline suite currently passes: Demo.spec.tsx and Example.spec.tsx.
- Example focused runs:
  - yarn test -- src/pages/Example/Example.spec.tsx
  - yarn test -- src/pages/Demo/Demo.spec.tsx
- Coverage: yarn test --coverage (Jest default report). Configure collectCoverage in jest.config.js if you need project-wide metrics.

## Jest/Vite/TS gotchas specific to this repo
- Dual tsconfig setup: Vite uses tsconfig.app.json (bundler mode); Jest uses tsconfig.json (node resolution). When adding new language features or path aliases, ensure both environments work or configure ts-jest to point at a tailored tsconfig.
- Encoding APIs: If adding libs requiring TextEncoder/TextDecoder, jest.setup.ts already polyfills; keep that file as the single place for such jsdom polyfills.
- Router imports: Prefer react-router-dom for web components; in tests, MemoryRouter from react-router-dom helps avoid real navigation. Align new code to this to reduce confusion.

## Build/CI suggestions
- Type checking in build: yarn build already enforces TS checks via tsc -b before bundling.
- If you add CI, run in this order for fast feedback and consistent results:
  1) yarn lint
  2) yarn test
  3) yarn build

## Cleanup after test demonstrations
- As a practice, remove any temporary test/demo files added purely to validate the pipeline, keeping the repo clean. Only persist meaningful test coverage.
