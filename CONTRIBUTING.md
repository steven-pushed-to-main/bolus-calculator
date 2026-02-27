# Contribution Process

## Standard Flow
1. Create a feature branch from `main`.
2. Make the change and run `npm test` locally.
3. Open a pull request into `main`.
4. Wait for the `Validate Pull Request` GitHub Actions workflow to pass.
5. Merge into `main`.
6. GitHub Actions deploys the app to GitHub Pages from `main`.

## Notes
- Keep changes scoped to one user-facing fix or feature per pull request when possible.
- If calculator logic changes, add or update both unit coverage and the browser flow test.
- Do not deploy from feature branches; `main` is the deploy branch.
