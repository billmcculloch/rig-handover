---
name: preview
description: Publish a rig page as a public preview on GitHub Pages, or take the lane marker off it. Use when a plan says to put a page on a public host for review, or to clean up a preview.
---

# preview

The preview is rendered and deployed by `.github/workflows/preview.yml`, never committed
(ADR 0003). It serves `/digest/2026-10-28` at `https://<owner>.github.io/<repo>/`. To preview
another page, change the path in the workflow's save step.

## Once per repo

Ask the human first: this makes a public page.

```sh
sed -n 's/^LANE_MARKER=//p' .env | tr -d '\n' | gh secret set LANE_MARKER
gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow
```

## Publish, with the marker

```sh
gh workflow run preview.yml -f marker=true
gh run watch <run id> --exit-status
```

Then check it the way the reviewer opens it, before sending the link:

```sh
curl -s https://<owner>.github.io/<repo>/ | grep -c "$LANE_MARKER"   # 1
```

## Take the marker off

Only after the review is in, and after asking the human. Same link, marker off:

```sh
gh workflow run preview.yml -f marker=false
curl -s https://<owner>.github.io/<repo>/ | grep -o '<span class="marker">[^<]*'   # no marker set
```

Pages can serve the old copy for a few seconds; fetch again before calling it failed.
