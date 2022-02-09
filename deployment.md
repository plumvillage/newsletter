# Deployment

## Prerequisites

1. Install [gsutil](https://cloud.google.com/storage/docs/gsutil_install#install)
2. Set the bucket name in `.env`

## Deploy

Because of the bug that currently sometimes renders 4 columns on first run, its best to have
Eleventy running so you can check if the layout your deploying is correct.

1. In [.eleventy](.eleventy) set `processImages` to `true`.
2. Run `npm start`, check if the layout is ok. Trigger a re-render if needed.
3. Run `npm run deploy`
