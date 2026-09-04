# Library App frontend

React single-page app for the Library App, built with [Vite](https://vite.dev).

## Run it

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:3001> and expects the backend on
<http://localhost:3000>. Start that first, or the book list comes back empty.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot module replacement |
| `npm start` | Same thing, kept so existing muscle memory works |
| `npm run build` | Production build into `build/` |
| `npm run preview` | Serve the production build locally |

## Layout

```
index.html            entry document, loads /src/index.jsx
vite.config.js        React plugin, port 3001, build output to build/
public/               copied to the build root as-is
src/
  index.jsx           mounts ModernApp
  ModernApp.jsx       the whole UI: routing, MUI theme, API calls
  ModernApp.css
  index.css
```

`API_BASE` at the top of `ModernApp.jsx` points at the backend. To make it
configurable, set `VITE_API_BASE` in `.env` and read `import.meta.env.VITE_API_BASE`.
Vite only exposes variables prefixed with `VITE_`.

## Note on the build tool

This was a Create React App project. `react-scripts` is discontinued and
accounted for the large majority of this repository's dependency advisories,
none of which had a fix. Moving to Vite removed them.
