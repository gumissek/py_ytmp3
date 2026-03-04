import os
import re
import json
import subprocess
import shutil
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="YouTube Downloader API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Downloads directory
DOWNLOADS_DIR = Path(__file__).parent / "downloads"
DOWNLOADS_DIR.mkdir(exist_ok=True)


def sanitize_filename(name: str) -> str:
    """Remove special characters from filename, keep spaces."""
    name = re.sub(r'[<>:"/\\|?*]', '', name)
    name = name.strip()
    return name[:100]  # limit length


def _get_yt_dlp_path() -> str:
    """Return path to yt-dlp executable."""
    path = shutil.which("yt-dlp")
    if not path:
        raise HTTPException(status_code=500, detail="yt-dlp is not installed or not found in PATH.")
    return path


# ── Models ──────────────────────────────────────────────

class VideoURLRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format: str = "mp3"  # "mp3" or "mp4"


class VideoInfoResponse(BaseModel):
    title: str
    author: str
    length: int  # seconds
    thumbnail_url: str
    views: int


class DownloadResponse(BaseModel):
    filename: str
    title: str
    size_mb: float


class FileItem(BaseModel):
    filename: str
    title: str
    size_mb: float
    is_mp3: bool


class PlaylistEntry(BaseModel):
    url: str
    title: str


class PlaylistInfoResponse(BaseModel):
    playlist_title: str
    entries: list[PlaylistEntry]


# ── Endpoints ───────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "message": "YouTube Downloader API"}


@app.post("/api/video-info", response_model=VideoInfoResponse)
async def get_video_info(req: VideoURLRequest):
    """Fetch video metadata from YouTube URL using yt-dlp."""
    try:
        yt_dlp_path = _get_yt_dlp_path()
        result = subprocess.run(
            [
                yt_dlp_path,
                "--dump-json",
                "--no-download",
                "--no-warnings",
                "--no-playlist",
                req.url,
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise Exception(result.stderr.strip() or "yt-dlp failed to fetch video info")

        data = json.loads(result.stdout)
        return VideoInfoResponse(
            title=data.get("title", "Unknown"),
            author=data.get("uploader", data.get("channel", "Unknown")),
            length=int(data.get("duration", 0)),
            thumbnail_url=data.get("thumbnail", ""),
            views=int(data.get("view_count", 0)),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch video info: {str(e)}")


@app.post("/api/playlist-info", response_model=PlaylistInfoResponse)
async def get_playlist_info(req: VideoURLRequest):
    """Fetch all video URLs from a YouTube playlist using yt-dlp."""
    try:
        yt_dlp_path = _get_yt_dlp_path()
        result = subprocess.run(
            [
                yt_dlp_path,
                "--flat-playlist",
                "--dump-json",
                "--no-warnings",
                "--yes-playlist",
                req.url,
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            raise Exception(result.stderr.strip() or "yt-dlp failed to fetch playlist info")

        entries: list[PlaylistEntry] = []
        playlist_title = "Playlist"
        for line in result.stdout.strip().splitlines():
            if not line:
                continue
            data = json.loads(line)
            # Each line is one entry in the flat playlist
            video_id = data.get("id") or data.get("url")
            title = data.get("title", video_id or "Unknown")
            if not data.get("_type") or data.get("_type") == "url":
                url = data.get("url") or data.get("webpage_url")
                if url and not url.startswith("http"):
                    url = f"https://www.youtube.com/watch?v={url}"
                if url:
                    entries.append(PlaylistEntry(url=url, title=title))
            # The first item may carry the playlist title
            if not playlist_title or playlist_title == "Playlist":
                playlist_title = data.get("playlist_title") or data.get("playlist") or playlist_title

        if not entries:
            raise Exception("No videos found in playlist")

        return PlaylistInfoResponse(playlist_title=playlist_title, entries=entries)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch playlist info: {str(e)}")


@app.post("/api/download", response_model=DownloadResponse)
async def download_video(req: DownloadRequest):
    """Download audio (MP3) or video (MP4) from YouTube using yt-dlp."""
    fmt = req.format.lower()
    if fmt not in ("mp3", "mp4"):
        raise HTTPException(status_code=400, detail="Invalid format. Use 'mp3' or 'mp4'.")
    try:
        yt_dlp_path = _get_yt_dlp_path()

        # First, get the title for naming
        info_result = subprocess.run(
            [yt_dlp_path, "--dump-json", "--no-download", "--no-warnings", "--no-playlist", req.url],
            capture_output=True, text=True, timeout=120,
        )
        if info_result.returncode != 0:
            raise Exception("Could not fetch video info")

        info_data = json.loads(info_result.stdout)
        title = info_data.get("title", "video")
        safe_title = sanitize_filename(title)
        output_filename = f"{safe_title}.{fmt}"
        output_template = str(DOWNLOADS_DIR / f"{safe_title}.%(ext)s")

        ffmpeg_path = shutil.which("ffmpeg")

        if fmt == "mp3":
            cmd = [
                yt_dlp_path,
                "-x",
                "--audio-format", "mp3",
                "--audio-quality", "192K",
                "-o", output_template,
                "--no-warnings",
                "--no-playlist",
            ]
        else:  # mp4
            cmd = [
                yt_dlp_path,
                "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
                "--merge-output-format", "mp4",
                "-o", output_template,
                "--no-warnings",
                "--no-playlist",
            ]

        if ffmpeg_path:
            cmd.extend(["--ffmpeg-location", os.path.dirname(ffmpeg_path)])

        cmd.append(req.url)

        dl_result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

        if dl_result.returncode != 0:
            raise Exception(dl_result.stderr.strip() or "yt-dlp download failed")

        output_path = DOWNLOADS_DIR / output_filename
        if not output_path.exists():
            # yt-dlp may have named the file slightly differently, search for it
            candidates = list(DOWNLOADS_DIR.glob(f"{safe_title}.*"))
            if candidates:
                output_path = candidates[0]
                output_filename = output_path.name
            else:
                raise Exception("Downloaded file not found")

        size_mb = round(output_path.stat().st_size / (1024 * 1024), 2)
        return DownloadResponse(
            filename=output_filename,
            title=title,
            size_mb=size_mb,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.get("/api/videos", response_model=list[FileItem])
async def list_videos():
    """List all downloaded MP3 and MP4 files."""
    files = []
    for f in DOWNLOADS_DIR.iterdir():
        if f.is_file() and f.suffix in (".mp3", ".mp4"):
            title = f.stem
            size_mb = round(f.stat().st_size / (1024 * 1024), 2)
            files.append(FileItem(
                filename=f.name,
                title=title,
                size_mb=size_mb,
                is_mp3=f.suffix == ".mp3",
            ))
    # Sort: newest first
    files.sort(key=lambda x: (DOWNLOADS_DIR / x.filename).stat().st_mtime, reverse=True)
    return files


@app.get("/api/files/{filename}")
async def serve_file(filename: str):
    """Serve a downloaded file."""
    file_path = DOWNLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    ext = file_path.suffix.lower()
    media_type = "video/mp4" if ext == ".mp4" else "audio/mpeg"

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
    )


@app.delete("/api/delete/{filename}")
async def delete_file(filename: str):
    """Delete a downloaded file."""
    file_path = DOWNLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    file_path.unlink()
    return {"message": f"Deleted {filename}"}
