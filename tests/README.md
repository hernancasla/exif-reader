# Tests

This folder contains the tests for the `exif-reader-ts` library.

## Structure

```
tests/
├── images/                    # Test images
│   ├── with_exif_base64.txt   # Base64 image with EXIF (example)
│   └── without_exif_base64.txt # Base64 image without EXIF (example)
├── exifmanager.test.ts        # Tests for ExifManager
└── README.md                  # This file
```

## Running tests

```bash
npm test
```

## Adding test images

To add new test images:

1. Place the images in the `images/` folder
2. If they are binary files, convert them to base64:
   ```bash
   base64 -i your_image.jpg > images/your_image_base64.txt
   ```
3. Add the prefix `data:image/jpeg;base64,` at the beginning of the file
4. Update the tests to use the new image

## Types of tests

- **EXIF reading**: Verifies that EXIF data can be read from images
- **Basic EXIF generation**: Verifies that basic data is generated when there is no EXIF
- **EXIF modification**: Verifies that EXIF data can be modified
- **EXIF removal**: Verifies that EXIF data can be removed
- **Base structure generation**: Verifies the generation of basic EXIF structures
- **User comments**: Verifies the handling of user comments

## Notes

- The tests use base64 images to avoid dependencies on external files
- The example images are minimal and may not contain real EXIF data
- For more realistic tests, use JPEG images with real EXIF data 