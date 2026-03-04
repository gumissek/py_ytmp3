"use client";

import { useEffect, useState } from "react";
import { Container } from "@mui/material";

import AppHeader from "./components/AppHeader";
import UrlInput from "./components/UrlInput";
import StatusMessage from "./components/StatusMessage";
import QueueSection from "./components/QueueSection";
import FileSection from "./components/FileSection";
import EmptyState from "./components/EmptyState";

import { useStatus } from "./hooks/useStatus";
import { useFiles } from "./hooks/useFiles";
import { useQueue } from "./hooks/useQueue";

export default function Home() {
  const { statusMessage, showStatus } = useStatus();
  const { files, fetchFiles, handleDelete } = useFiles(showStatus);
  const [format, setFormat] = useState<"mp3" | "mp4">("mp3");

  const {
    url, setUrl, queue, isDownloadingAll, readyCount, doneCount,
    addToQueue, removeFromQueue,
    downloadSingle, downloadAll, clearDone,
  } = useQueue(showStatus, fetchFiles, format);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const mp3Files = files.filter((f) => f.is_mp3);
  const mp4Files = files.filter((f) => !f.is_mp3);

  return (
    <Container maxWidth="md" sx={{ py: 5, pb: 10 }}>
      <AppHeader />
      <UrlInput
        url={url}
        setUrl={setUrl}
        onAdd={addToQueue}
        format={format}
        onFormatChange={setFormat}
      />
      <StatusMessage statusMessage={statusMessage} />

      <QueueSection
        queue={queue}
        readyCount={readyCount}
        doneCount={doneCount}
        isDownloadingAll={isDownloadingAll}
        onClearDone={clearDone}
        onDownload={downloadSingle}
        onRemove={removeFromQueue}
        onDownloadAll={downloadAll}
      />

      <FileSection
        title="Pliki MP3"
        icon="🎵"
        files={mp3Files}
        onDelete={handleDelete}
      />

      <FileSection
        title="Pliki MP4"
        icon="🎬"
        files={mp4Files}
        onDelete={handleDelete}
      />

      {files.length === 0 && queue.length === 0 && <EmptyState />}
    </Container>
  );
}
