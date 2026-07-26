#!/usr/bin/env python3
"""Fetch all flash-attention prebuild wheels and emit wheels.json for the web app.

Usage: python3 build_data.py [-o wheels.json]
Set GITHUB_TOKEN to raise the API rate limit.
"""

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

REPO = "mjun0812/flash-attention-prebuild-wheels"
API = f"https://api.github.com/repos/{REPO}/releases"

# flash_attn-2.8.3+cu126torch2.13-cp310-cp310-linux_aarch64.whl
# flash_attn_3-3.0.0+cu126torch2.13gite2743ab-cp39-abi3-manylinux_2_24_x86_64...whl
WHEEL_RE = re.compile(
    r"^(?P<dist>[A-Za-z_][\w]*?)-"
    r"(?P<fa>\d[\w.]*?)"
    r"\+cu(?P<cuda>\d+)torch(?P<torch>[\d.]+)(?:git(?P<git>\w+))?-"
    r"(?P<pytag>[^-]+)-(?P<abi>[^-]+)-(?P<plat>.+)\.whl$"
)


def get(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


def fetch_releases():
    releases, page = [], 1
    while True:
        batch = get(f"{API}?per_page=100&page={page}")
        if not batch:
            break
        releases.extend(batch)
        page += 1
    return releases


def cuda_label(digits):
    """126 -> 12.6, 1300 -> 13.0 (trailing 0 padding varies)."""
    if len(digits) >= 3:
        major, rest = digits[:2], digits[2:]
        minor = rest.rstrip("0") or "0"
        return f"{major}.{minor[0]}"
    return digits


def python_label(pytag, abi):
    """cp310/cp310 -> 3.10; cp314/cp314t -> 3.14t; cp39/abi3 -> 3.9+ (abi3)."""
    m = re.match(r"cp(\d)(\d+)", pytag)
    if not m:
        return pytag
    ver = f"{m.group(1)}.{m.group(2)}"
    if abi.startswith("abi3"):
        return f"{ver}+ (abi3)"
    return ver + "t" if abi.endswith("t") else ver


def platform_label(plat):
    """Pick the most specific tag from a compound platform tag."""
    arch = "arm64" if ("aarch64" in plat or "arm64" in plat) else "x86_64"
    tags = plat.split(".")
    many = [t for t in tags if t.startswith("manylinux")]
    if many:
        # Highest glibc version wins (manylinux_2_28 > manylinux_2_24).
        def glibc(tag):
            m = re.match(r"manylinux_(\d+)_(\d+)_", tag)
            return (int(m.group(1)), int(m.group(2))) if m else (2, 17)

        best = max(many, key=glibc)
        major, minor = glibc(best)
        return f"manylinux_{major}_{minor} {arch}", arch
    return f"Linux {arch}", arch


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--out", default="public/wheels.json")
    args = ap.parse_args()

    try:
        releases = fetch_releases()
    except urllib.error.HTTPError as e:
        sys.exit(f"GitHub API error {e.code}: {e.reason} (try setting GITHUB_TOKEN)")

    wheels, skipped = [], 0
    for rel in releases:
        for asset in rel.get("assets", []):
            m = WHEEL_RE.match(asset["name"])
            if not m:
                skipped += 1
                continue
            plat_label, arch = platform_label(m["plat"])
            wheels.append(
                {
                    "name": asset["name"],
                    "url": asset["browser_download_url"],
                    "size": asset["size"],
                    "release": rel["tag_name"],
                    "package": m["dist"],
                    "fa": m["fa"],
                    "cuda": cuda_label(m["cuda"]),
                    "torch": m["torch"],
                    "python": python_label(m["pytag"], m["abi"]),
                    "abi3": m["abi"].startswith("abi3"),
                    "platform": plat_label,
                    "arch": arch,
                }
            )

    # Newest release first; the API already returns them in that order.
    data = {"repo": REPO, "count": len(wheels), "wheels": wheels}
    with open(args.out, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"wrote {args.out}: {len(wheels)} wheels from {len(releases)} releases "
          f"({skipped} non-wheel assets skipped)")


if __name__ == "__main__":
    main()
