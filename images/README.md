# OS Images Directory

Place your `.img.gz` file here for the emulator to use.

## Required File

The emulator expects a file named:
```
alpine-midori.img.gz
```

## How to Get the Image

Download the Alpine Linux with Midori browser image from:
https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz

Or use this command:
```bash
curl -L -o alpine-midori.img.gz https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz
```

## File Structure

After downloading, your directory should look like:
```
images/
├── README.md (this file)
└── alpine-midori.img.gz (your downloaded image)
```

**Note:** The `.img.gz` file is not included in the repository due to its large size. You must download it separately before using the emulator.
