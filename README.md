# Flash Attention Wheel Finder

Search the prebuilt `flash-attn` wheels published by
[mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels)
by Flash-Attention, Python, CUDA and PyTorch version, then copy the exact
`pip install <url>` command.

React + Vite + Tailwind v4 + shadcn/ui, Geist Mono throughout, monochrome light/dark theme.

## Usage

```sh
pnpm install
pnpm data     # regenerate public/wheels.json from the GitHub releases API
pnpm dev
```

`pnpm build` type-checks and emits a static `dist/` you can host anywhere.

Set `GITHUB_TOKEN` before `pnpm data` if you hit the unauthenticated API rate limit.

## Layout

- `build_data.py` — pulls every release asset and parses the wheel filenames
  (`flash_attn-2.8.3+cu126torch2.13-cp310-cp310-linux_x86_64.whl`) into structured
  fields → `public/wheels.json` (~3.5k wheels, 1.4 MB).
- `src/lib/wheels.ts` — types, version-aware sorting, search and facet computation.
- `src/App.tsx` — page shell, filter state, URL sync.
- `src/components/ui/` — shadcn primitives.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to
`main`, on manual dispatch, and daily at 05:17 UTC.

The daily run regenerates `public/wheels.json`, commits it **only** when new wheels
appeared upstream, and redeploys. GitHub cannot notify this repository about releases in
a repository it doesn't own, so a new upstream release is picked up by that poll rather
than by a webhook — worst case the site is a day behind. Run the workflow manually
(Actions → Build and deploy → Run workflow) to pick one up immediately.

`BASE_PATH` is set by CI to `/<repo>/` for the project-site subpath; it defaults to `/`
locally and for custom domains.

## Notes

Data comes from the release **assets** rather than
[`doc/release_history.md`](https://github.com/mjun0812/flash-attention-prebuild-wheels/blob/main/doc/release_history.md):
assets give exact filenames and download URLs instead of a version matrix.

Facet dropdowns are interdependent — each one's options are computed against the *other*
active filters, so no selection can produce an empty result set. Filters are mirrored into
the URL query string, so a search is linkable.

`public/wheels.json` is a snapshot; re-run `pnpm data` to pick up new releases.
