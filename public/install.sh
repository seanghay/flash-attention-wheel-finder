#!/usr/bin/env bash
# Install a prebuilt flash-attn wheel matching the current environment.
#
#   curl -fsSL https://seanghay.github.io/flash-attention-wheel-finder/install.sh | bash
#
# Environment:
#   FA_VERSION   pin a flash-attn version (default: newest available)
#   PYTHON       python to target and install into (default: python3)
#   DRY_RUN=1    print the wheel URL and exit without installing
#
# Linux only. The upstream project does not build for macOS or Windows.
set -euo pipefail

INDEX_URL="${INDEX_URL:-https://seanghay.github.io/flash-attention-wheel-finder/wheels.json}"
PYTHON="${PYTHON:-python3}"

die() { printf '\033[31merror:\033[0m %s\n' "$1" >&2; exit 1; }
info() { printf '\033[2m%s\033[0m\n' "$1" >&2; }

[ "$(uname -s)" = "Linux" ] || die "these wheels are built for Linux only (found $(uname -s))."
command -v "$PYTHON" >/dev/null 2>&1 || die "$PYTHON not found. Set PYTHON=/path/to/python."
"$PYTHON" -c 'import torch' 2>/dev/null || die "PyTorch is not installed in $PYTHON. Install torch first — the wheel is built against a specific torch version."

info "resolving wheel for $("$PYTHON" -c 'import sys;print("python %d.%d"%sys.version_info[:2])') on $(uname -m)…"

# Detection and matching both run in the target interpreter, so the reported
# python/torch/CUDA are exactly the ones the wheel gets installed into. The
# index is fetched here rather than in the shell: it is ~1.4 MB, which is too
# large to pass through the environment on many systems.
URL="$(FA_VERSION="${FA_VERSION:-}" INDEX_URL="$INDEX_URL" "$PYTHON" - <<'PY'
import json, os, platform, re, sys
import urllib.request

import torch

try:
    with urllib.request.urlopen(os.environ["INDEX_URL"], timeout=30) as r:
        wheels = json.load(r)["wheels"]
except Exception as e:
    sys.exit(f"could not fetch the wheel index: {e}")
pin = os.environ.get("FA_VERSION") or None

py = "%d.%d" % sys.version_info[:2]
free_threaded = not getattr(sys, "_is_gil_enabled", lambda: True)()
if free_threaded:
    py += "t"

torch_mm = ".".join(torch.__version__.split("+")[0].split(".")[:2])
cuda = torch.version.cuda
if not cuda:
    sys.exit("this torch build has no CUDA support (torch.version.cuda is None).")

arch = "arm64" if platform.machine() in ("aarch64", "arm64") else "x86_64"


def key(v):
    """Sort versions numerically: 2.8.3 above 2.8.0, and a release above its .post."""
    return [int(n) for n in re.findall(r"\d+", v)]


def python_ok(w):
    if not w["abi3"]:
        return w["python"] == py
    # abi3 wheels declare a floor, e.g. "3.9+ (abi3)"; free-threaded builds
    # cannot load them.
    if free_threaded:
        return False
    floor = re.match(r"(\d+)\.(\d+)", w["python"])
    return tuple(map(int, floor.groups())) <= sys.version_info[:2]


matches = [
    w for w in wheels
    if w["arch"] == arch
    and w["torch"] == torch_mm
    and w["cuda"] == cuda
    and python_ok(w)
    and (pin is None or w["fa"] == pin)
]

if not matches:
    near = sorted({(w["fa"], w["torch"], w["cuda"]) for w in wheels if w["arch"] == arch})
    print(
        f"no wheel for python {py} / torch {torch_mm} / cuda {cuda} / {arch}.\n"
        f"Browse what exists at https://seanghay.github.io/flash-attention-wheel-finder/"
        f"?torch={torch_mm}\n"
        f"({len(near)} build combinations exist for {arch}.)",
        file=sys.stderr,
    )
    sys.exit(1)

# Ranked: the flash_attn package first (flash-attn 3 ships as flash_attn_3, a
# separate import, so it is opt-in via FA_VERSION), then manylinux over the bare
# linux tag since it is portable across glibc versions, then the newest build.
matches.sort(
    key=lambda w: (
        w["package"] == "flash_attn",
        w["platform"].startswith("manylinux"),
        key(w["fa"]),
    )
)
best = matches[-1]

print(best["url"])
print(
    f"{best['package'].replace('_', '-')} {best['fa']} · python {best['python']}"
    f" · cuda {best['cuda']} · torch {best['torch']} · {best['platform']}",
    file=sys.stderr,
)
PY
)" || exit 1

info "→ $(basename "${URL%%\?*}")"

if [ -n "${DRY_RUN:-}" ]; then
  echo "$URL"
  exit 0
fi

exec "$PYTHON" -m pip install "$URL"
