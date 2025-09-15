## exif-reader-ts Documentation

Welcome to the official documentation for `exif-reader-ts`, a TypeScript library for reading, generating, and modifying EXIF metadata.

- Quickstart: See installation and common usage
- API Reference: Detailed documentation for public classes and types

### Get Started

- Quickstart Guide: [docs/quickstart.md](./quickstart.md)
- API Reference: [docs/api](./api/README.md)

### Key Capabilities

- Read EXIF from base64 strings or image URLs (browser)
- Generate base EXIF structures when images lack metadata
- Modify or remove EXIF metadata in base64 images
- Extract GPS coordinates from EXIF GPS data in multiple formats

### Environment Notes

- Browser: All features supported; URL reading depends on `fetch`, `Image`, and `FileReader` APIs.
- Node: Operate on base64 image strings. URL reading is intended for browsers.