"""Package the generated /docs site for the GitHub Pages workflow."""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
source = root / "docs"
output = root / "site.zip"
files = sorted(path for path in source.rglob("*") if path.is_file())

if not files or not (source / "index.html").is_file():
    raise RuntimeError("Build the static site first: python scripts/build_pages.py")

with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=6) as archive:
    for path in files:
        archive.write(path, path.relative_to(source).as_posix())

print(f"Packaged {len(files)} files: {output}")
print(f"Size: {output.stat().st_size / 1024 / 1024:.2f} MiB")
