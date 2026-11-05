# TCI Podcast Network

Static website for The Canadian Investor, The Canadian Real Estate Investor, and The Canadian Macro Investor. The pages, styles, scripts, and assets are the uploaded site.

## Local preview

No install and no framework. From the repository root:

```bash
node scripts/build-static.mjs
python3 -m http.server 8080 --directory dist
```

Open http://127.0.0.1:8080/

`node scripts/build-static.mjs` checks local links and copies the site into `dist/`. It does not rewrite the design.

## Vercel

Import this repository. Do not attach a custom domain from the repo; domain setup is separate. No environment variables or tokens are required.

| Setting | Value |
| --- | --- |
| Framework preset | Other (`framework: null`) |
| Root directory | `.` (repository root) |
| Install command | empty (skipped) |
| Build command | `node scripts/build-static.mjs` |
| Output directory | `dist` |

`vercel.json` sets `trailingSlash: true` so `/shows/.../`, `/episodes/.../`, and `/blog/.../` match the pages' existing canonical paths. File URLs such as `/episodes/index.html` are left unchanged. `cleanUrls` stays off so the site's relative `index.html` links keep working.

The published output is the static site only. README and scripts stay out of `dist/`.

## Deployment notes from the uploaded source

- `404.html` uses `<base href="/">` so its stylesheet and home link resolve when Vercel serves that file for an unknown URL. Every other page keeps its original `<base href>`.
- Canonical, Open Graph, sitemap, and robots URLs still point at `https://tci-design-directions.simonbh.chatgpt.site/`.
- Pages include `noindex`.
- The contact forms are the uploaded preview and do not submit anywhere.
- YouTube cards are the snapshot in the HTML. `app.js` requests `/api/youtube` only on localhost.
