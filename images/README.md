# OS Images Directory

Place your `.img` file here for the emulator to use.

## Required File

The emulator expects a file named:
```
alpine-midori.img
```

## How to Get the Image

Download the Alpine Linux with Midori browser image from:
https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz

Then extract it:
```bash
gunzip alpine-midori.img.gz
```

Or use this command to download and extract in one step:
```bash
curl -L https://github.com/sriail/file-serving/releases/download/browser-packages/alpine-midori.img.gz | gunzip > alpine-midori.img
```

## File Structure

After downloading and extracting, your directory should look like:
```
images/
├── README.md (this file)
└── alpine-midori.img (your extracted image)
```

**Note:** The `.img` file is not included in the repository due to its large size. You must download and extract it separately before using the emulator.
