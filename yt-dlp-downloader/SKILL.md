---
name: yt-dlp-downloader
description: A skill for downloading videos from various websites using yt-dlp, a powerful command-line video downloader. Use this skill when users provide a video URL and request to download it, or when they need guidance on using yt-dlp for video downloads.
---

# yt-dlp Video Downloader

## Overview

This skill enables downloading videos from thousands of websites using yt-dlp, a feature-rich command-line audio/video downloader. It provides step-by-step instructions for downloading videos, including how to install yt-dlp, basic download commands, and advanced options for format selection and batch downloads.

## Quick Start

### Prerequisites

1. **Install yt-dlp**:
   - Windows: 
     - Option 1: Download the standalone executable from [yt-dlp releases](https://github.com/yt-dlp/yt-dlp/releases)
     - Option 2: Use `pip install yt-dlp` (Python required)
   - macOS/Linux: Use `pip install yt-dlp` or download the standalone executable

2. **Optional dependencies**:
   - `ffmpeg` for video conversion and merging
   - `aria2c` for faster downloads

### Handling PATH Issues

If you get a "command not found" error after installing with pip, try:

1. **Using Python module**:
   ```bash
   python -m yt-dlp [VIDEO_URL]
   ```

2. **Using absolute path**:
   - Windows: `"C:\Users\[Username]\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts\yt-dlp.exe" [VIDEO_URL]`
   - macOS/Linux: `~/.local/bin/yt-dlp [VIDEO_URL]`

### Basic Download

To download a video, run:

```bash
yt-dlp [VIDEO_URL]
```

Example:
```bash
yt-dlp https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Using the Helper Script

For easier usage, especially if yt-dlp is not in PATH, use the included script:

```bash
python download_video.py [VIDEO_URL]
```

Example:
```bash
python download_video.py https://www.bilibili.com/video/BV1kJFgzJECg
```

## Advanced Options

### Format Selection

Specify video quality:
```bash
yt-dlp -f best [VIDEO_URL]
```

Download best video + best audio:
```bash
yt-dlp -f bestvideo+bestaudio [VIDEO_URL]
```

### Subtitles

Download subtitles:
```bash
yt-dlp --write-sub [VIDEO_URL]
```

Download auto-generated subtitles:
```bash
yt-dlp --write-auto-sub [VIDEO_URL]
```

### Batch Downloads

Download multiple videos from a text file:
```bash
yt-dlp -a urls.txt
```

### Playlist Downloads

Download entire playlist:
```bash
yt-dlp [PLAYLIST_URL]
```

Download specific videos from playlist:
```bash
yt-dlp --playlist-items 1,3,5 [PLAYLIST_URL]
```

## Scripts

This skill includes a helper script to simplify video downloads:

### download_video.py

A Python script that wraps yt-dlp commands for easier usage. Key features:

- **Automatic yt-dlp detection**: Tries multiple ways to find yt-dlp:
  1. Direct command (`yt-dlp`)
  2. Python module (`python -m yt-dlp`)
  3. Windows absolute paths (multiple locations)

- **Error handling**: Provides clear error messages and installation instructions if yt-dlp is not found

- **Format selection**: Supports specifying video quality

- **Output directory**: Allows customizing where videos are saved

- **Subtitle support**: Can download subtitles alongside videos

- **Playlist support**: Can download entire playlists

### Usage Examples

```bash
# Basic download
python download_video.py https://www.bilibili.com/video/BV1kJFgzJECg

# With format selection
python download_video.py https://www.youtube.com/watch?v=dQw4w9WgXcQ --format best

# With output directory
python download_video.py https://www.tiktok.com/@user/video/123456789 --output ./downloads

# With subtitles
python download_video.py https://www.youtube.com/watch?v=dQw4w9WgXcQ --subtitles

# Download playlist
python download_video.py https://www.youtube.com/playlist?list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v --playlist
```

## References

### Supported Sites

yt-dlp supports thousands of sites, including:
- YouTube
- Bilibili
- TikTok
- Instagram
- Facebook
- Vimeo
- Twitter
- and many more

### Full Documentation

For complete documentation, visit the [yt-dlp GitHub repository](https://github.com/yt-dlp/yt-dlp) or run:

```bash
yt-dlp --help
```
