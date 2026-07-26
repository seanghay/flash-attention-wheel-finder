# flash-attention-wheel-finder

Finding the right prebuilt `flash-attn` wheel means matching four things at once:
flash-attn version, Python, CUDA and PyTorch. This site lets you filter on all four and
gives you the `pip install` line for the wheel you land on.

Wheels come from [mjun0812/flash-attention-prebuild-wheels](https://github.com/mjun0812/flash-attention-prebuild-wheels).

Live: https://seanghay.github.io/flash-attention-wheel-finder/

## Install a wheel without picking one

```sh
curl -fsSL https://seanghay.github.io/flash-attention-wheel-finder/install.sh | bash
```

Reads your Python, torch and CUDA versions, finds the wheel that matches, and pips it in.
Linux only, and torch has to be installed already since the wheel is built against a
specific version of it.

| | |
|---|---|
| `FA_VERSION=2.7.4` | pin a flash-attn version instead of taking the newest |
| `PYTHON=/path/to/python` | target a different interpreter |
| `DRY_RUN=1` | print the wheel URL and stop |

flash-attn 3 installs as `flash_attn_3`, a separate import, so you only get it with
`FA_VERSION=3.0.0` or if it's the sole match for your setup.

## Running it

```sh
pnpm install
pnpm dev
```

`pnpm build` writes a static `dist/`.

## The data

`build_data.py` walks the releases API and parses each asset filename:

```
flash_attn-2.8.3+cu126torch2.13-cp310-cp310-linux_x86_64.whl
            ^     ^     ^        ^         ^     ^
            fa    cuda  torch    python    abi   platform
```

That gets written to `public/wheels.json` (about 3.5k wheels, 1.4 MB). Regenerate with
`pnpm data`. Export `GITHUB_TOKEN` first if you hit the anonymous rate limit.

There's also a [release_history.md](https://github.com/mjun0812/flash-attention-prebuild-wheels/blob/main/doc/release_history.md)
upstream, but it only lists a version matrix. The assets give you real filenames and
download URLs, so that's what this uses.

## Deploys

`.github/workflows/deploy.yml` publishes to GitHub Pages on push to `main`, on manual
dispatch, and once a day at 05:17 UTC. The daily run regenerates the index and only
commits when something actually changed.

A release upstream can't trigger a build here, since it's someone else's repo, so the
daily run is a poll. The site can be up to a day behind. If you need a new release
sooner, trigger the workflow by hand from the Actions tab.

CI sets `BASE_PATH=/<repo>/` for the Pages subpath. It defaults to `/` everywhere else.

## Code

- `src/lib/wheels.ts` — search, sorting, facet options
- `src/lib/dimensions.tsx` — the icon and color assigned to each of the four versions
- `src/App.tsx` — filter state, URL sync
- `src/components/ui/` — shadcn

Two things worth knowing if you touch the filtering: each dropdown's options are computed
from the *other* active filters, so you can't pick a combination that returns nothing. And
filters are written to the query string, so any search is a shareable link.
