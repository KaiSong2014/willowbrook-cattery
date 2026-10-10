"""Assemble the static site before packaging it for GitHub Pages."""

from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
output = (root / "docs").resolve()
if output.parent != root or output.name != "docs":
    raise RuntimeError("Refusing to replace a directory outside this project")

files = [
    "index.html",
    "styles.css",
    "script.js",
    "images/1.png",
    "assets/garden.webp",
    "assets/video/hero-poster.webp",
    "assets/video/hero-idle-loop.mp4",
]
for folder in ("assets/cats", "assets/js", "assets/frames"):
    files.extend(str(path.relative_to(root)) for path in (root / folder).iterdir() if path.is_file())

if output.exists():
    shutil.rmtree(output)
output.mkdir()
for relative in files:
    source = root / relative
    if not source.is_file():
        raise FileNotFoundError(source)
    destination = output / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
(output / ".nojekyll").touch()
print(f"Built {len(files)} files in {output}")
print(f"Total: {sum(path.stat().st_size for path in output.rglob('*') if path.is_file()) / 1_000_000:.1f} MB")
