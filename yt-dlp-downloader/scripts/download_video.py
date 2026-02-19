#!/usr/bin/env python3
"""
Video download script using yt-dlp

This script provides a simple interface to yt-dlp for downloading videos from various websites.
"""

import subprocess
import argparse
import os

def download_video(url, format_option=None, output_dir=None, subtitles=False, playlist=False):
    """
    Download video using yt-dlp
    
    Args:
        url (str): Video URL to download
        format_option (str, optional): Format selection option
        output_dir (str, optional): Output directory
        subtitles (bool, optional): Whether to download subtitles
        playlist (bool, optional): Whether to download entire playlist
    """
    # Build command
    # Try different ways to find yt-dlp
    yt_dlp_cmd = None
    
    # First try direct command
    try:
        subprocess.run(['yt-dlp', '--version'], check=True, capture_output=True, text=True)
        yt_dlp_cmd = ['yt-dlp']
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Try Python module
        try:
            subprocess.run(['python', '-m', 'yt-dlp', '--version'], check=True, capture_output=True, text=True)
            yt_dlp_cmd = ['python', '-m', 'yt-dlp']
        except (subprocess.CalledProcessError, FileNotFoundError):
            # Try absolute path (Windows specific)
            windows_path = r'C:\Users\Administrator\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts\yt-dlp.exe'
            if os.path.exists(windows_path):
                yt_dlp_cmd = [windows_path]
            else:
                # Try another common Windows path
                import getpass
                username = getpass.getuser()
                alt_windows_path = fr'C:\Users\{username}\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0\LocalCache\local-packages\Python312\Scripts\yt-dlp.exe'
                if os.path.exists(alt_windows_path):
                    yt_dlp_cmd = [alt_windows_path]
    
    if not yt_dlp_cmd:
        print("Error: yt-dlp not found. Please install yt-dlp first.")
        print("Installation options:")
        print("1. Windows: Download standalone executable from https://github.com/yt-dlp/yt-dlp/releases")
        print("2. All platforms: Run 'pip install yt-dlp' (Python required)")
        return
    
    cmd = yt_dlp_cmd
    
    # Add format option if specified
    if format_option:
        cmd.extend(['-f', format_option])
    
    # Add output directory if specified
    if output_dir:
        cmd.extend(['-o', os.path.join(output_dir, '%(title)s.%(ext)s')])
    
    # Add subtitles option if specified
    if subtitles:
        cmd.append('--write-sub')
    
    # Add playlist option if specified
    if playlist:
        cmd.append('--yes-playlist')
    
    # Add URL
    cmd.append(url)
    
    # Execute command
    print(f"Downloading video from: {url}")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("Download completed successfully!")
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error downloading video: {e}")
        print(f"Error output: {e.stderr}")
    except FileNotFoundError:
        print("Error: yt-dlp not found. Please install yt-dlp first.")

def main():
    """
    Main function
    """
    parser = argparse.ArgumentParser(description='Download videos using yt-dlp')
    parser.add_argument('url', help='Video URL to download')
    parser.add_argument('--format', '-f', help='Format selection option (e.g., best, bestvideo+bestaudio)')
    parser.add_argument('--output', '-o', help='Output directory')
    parser.add_argument('--subtitles', '-s', action='store_true', help='Download subtitles')
    parser.add_argument('--playlist', '-p', action='store_true', help='Download entire playlist')
    
    args = parser.parse_args()
    
    download_video(
        args.url,
        format_option=args.format,
        output_dir=args.output,
        subtitles=args.subtitles,
        playlist=args.playlist
    )

if __name__ == '__main__':
    main()
