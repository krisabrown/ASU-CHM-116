# Chemistry Final Grade Calculator

This is a Vite React app for GitHub Pages.

## Local setup

```bash
npm install
npm run build
npm run preview
```

For local development:

```bash
npm run dev
```

## GitHub Pages setup

This project is configured for a GitHub repository named `ASU-CHM-116`.

The important setting is in `vite.config.js`:

```js
base: "/ASU-CHM-116/"
```

In GitHub, go to:

Settings → Pages → Build and deployment → Source → GitHub Actions

Then push to the `main` branch. The included GitHub Action will build the site and deploy the `dist` folder.

Your site URL should be:

```txt
https://krisabrown.github.io/ASU-CHM-116/
```

## Important

Do not edit `index.html` to point to `./src/main.jsx` or any built asset manually. Keep this line as-is:

```html
<script type="module" src="/src/main.jsx"></script>
```

Vite rewrites it during `npm run build`.
