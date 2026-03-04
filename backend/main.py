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


@app.post("/api/download", response_model=DownloadResponse)
async def download_mp3(req: VideoURLRequest):
    """Download audio from YouTube as MP3 using yt-dlp."""
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
        title = info_data.get("title", "audio")
        safe_title = sanitize_filename(title)
        mp3_filename = f"{safe_title}.mp3"
        output_template = str(DOWNLOADS_DIR / f"{safe_title}.%(ext)s")

        # Download and convert to MP3
        ffmpeg_path = shutil.which("ffmpeg")
        cmd = [
            yt_dlp_path,
            "-x",                        # extract audio
            "--audio-format", "mp3",     # convert to mp3
            "--audio-quality", "192K",   # 192kbps
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

        mp3_path = DOWNLOADS_DIR / mp3_filename
        if not mp3_path.exists():
            # yt-dlp may have named the file slightly differently, search for it
            candidates = list(DOWNLOADS_DIR.glob(f"{safe_title}.*"))
            if candidates:
                mp3_path = candidates[0]
                mp3_filename = mp3_path.name
            else:
                raise Exception("Downloaded file not found")

        size_mb = round(mp3_path.stat().st_size / (1024 * 1024), 2)
        return DownloadResponse(
            filename=mp3_filename,
            title=title,
            size_mb=size_mb,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.get("/api/videos", response_model=list[FileItem])
async def list_videos():
    """List all downloaded MP3 files."""
    files = []
    for f in DOWNLOADS_DIR.iterdir():
        if f.is_file() and f.suffix == ".mp3":
            title = f.stem
            size_mb = round(f.stat().st_size / (1024 * 1024), 2)
            files.append(FileItem(
                filename=f.name,
                title=title,
                size_mb=size_mb,
                is_mp3=True,
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

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="audio/mpeg",
    )


@app.delete("/api/delete/{filename}")
async def delete_file(filename: str):
    """Delete a downloaded file."""
    file_path = DOWNLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    file_path.unlink()
    return {"message": f"Deleted {filename}"}
