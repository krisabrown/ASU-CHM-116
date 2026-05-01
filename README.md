Chemistry Final Grade Calculator

A React and Vite app for calculating CHM 116 final grade scenarios.

Local setup

1. Run npm install
2. Run npm run dev
3. Open the local URL shown in your terminal

GitHub Pages setup

This project includes a GitHub Actions workflow at .github/workflows/deploy.yml.

Before deploying, open vite.config.js and make sure this line matches your GitHub repository name:

base: "/chemistry-grade-calculator/"

For example, if your repository is named final-grade-calculator, change it to:

base: "/final-grade-calculator/"

Then push the files to the main branch and set GitHub Pages to use GitHub Actions.
