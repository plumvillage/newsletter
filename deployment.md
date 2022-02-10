# Deployment

## Prerequisites

1. Install the Netlify CLI: `npm install netlify-cli -g`
2. Login: `netlify login`

## Deploy

Because of the bug that currently sometimes renders 4 columns on first run, its best to have
Eleventy running so you can check if the layout your deploying is correct.

1. In [.eleventy](.eleventy) set `processImages` to `true`.
2. Run `npm start`, check if the layout is ok. Trigger a re-render if needed.
3. Run `npm run deploy`
