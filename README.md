# py_ytmp3

A web application for downloading YouTube audio and video — supports single videos **and entire playlists** in **MP3** or **MP4** format.

- **Backend** – FastAPI + yt-dlp + ffmpeg (Python 3.12)
- **Frontend** – Next.js 16 + Material UI (Node 20)

---

## Features

- Paste one or more YouTube links (one per line or comma-separated)
- **Format selector** – choose **MP3** (audio only, 192 kbps) or **MP4** (best quality video + audio) before adding to the queue
- Each queue item displays its target format (MP3 / MP4) with a colour-coded badge
- **Playlist support** – paste a playlist URL and every video is automatically expanded into the queue
- Mix single videos and playlists in the same input
- Download individual tracks/videos or the entire queue at once
- Separate sections for downloaded MP3 and MP4 files
- Persistent storage across container restarts (named Docker volume)

---

## Requirements

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2 (plugin) |

---

## Quick start (recommended)

The start scripts handle Docker checks, build the containers, and open the browser automatically. All of them detect missing / stopped Docker and print a clear error message instead of failing silently.

### macOS / Linux

```bash
chmod +x start.sh
./start.sh
```

### Windows – PowerShell

```powershell
.\start.ps1
```

> If you get an execution-policy error run once:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### Windows – Command Prompt

Double-click **start.bat** or run it from `cmd`:

```bat
start.bat
```

Once the build is complete the browser opens automatically at <http://localhost:3000>.

---

## Running with Docker Compose (manual)

```bash
# Build images and start containers
docker compose up --build
```

Once the build is complete:

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:3000> |
| Backend API | <http://localhost:8000> |
| Swagger docs | <http://localhost:8000/docs> |

Stop all containers:

```bash
docker compose down
```

---

## Downloads volume

MP3 and MP4 files are stored in a named Docker volume `mp3_downloads`, mounted inside the backend container at `/app/downloads`.  
This keeps downloaded files **off the host filesystem** while making them persistent across container restarts.

```
mp3_downloads  →  /app/downloads  (inside container)
```

List the contents of the volume:

```bash
docker run --rm -v mp3_downloads:/data alpine ls /data
```

Delete all downloaded files (remove the volume):

```bash
docker compose down -v
```

> **Warning:** `-v` removes the volume — all downloaded MP3s will be permanently deleted.

---

## Changing the backend URL (remote deployment)

`NEXT_PUBLIC_API_URL` is baked into the frontend at **build time**. Before building for a remote server, set it to the public address of the backend:

```bash
# Example: server at 192.168.1.100
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000 docker compose up --build
```

Or edit `docker-compose.yml` directly:

```yaml
args:
  NEXT_PUBLIC_API_URL: http://your-server:8000
```

---

## Running locally (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> External tools required: `ffmpeg` and `yt-dlp` must be available in PATH.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App will be available at <http://localhost:3000>.

---

## Project structure

```
py_ytmp3/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── main.py          # FastAPI – API endpoints (MP3 + MP4 download)
│   ├── requirements.txt
│   └── downloads/       # local temp dir / Docker volume mount
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── next.config.ts
│   ├── package.json
│   └── app/
│       ├── types.ts     # API_BASE, TypeScript models (QueueItem with format field)
│       ├── hooks/       # useQueue (format selector, playlist expansion), useFiles, useStatus
│       └── components/  # React components (UrlInput with MP3/MP4 toggle)
├── docker-compose.yml
├── start.sh             # Quick-start: macOS / Linux
├── start.ps1            # Quick-start: Windows (PowerShell)
├── start.bat            # Quick-start: Windows (Command Prompt)
└── README.md
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Server status |
| `POST` | `/api/video-info` | Fetch video metadata (title, author, duration, thumbnail) |
| `POST` | `/api/playlist-info` | Fetch all video URLs and titles from a YouTube playlist |
| `POST` | `/api/download` | Download and convert to MP3 or MP4 (`{ "url": "...", "format": "mp3"/"mp4" }`) |
| `GET` | `/api/videos` | List all downloaded MP3 and MP4 files |
| `GET` | `/api/files/{filename}` | Serve / download an MP3 or MP4 file |
| `DELETE` | `/api/delete/{filename}` | Delete a file |

Full interactive docs: <http://localhost:8000/docs>
