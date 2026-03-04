"use client";

import { useEffect } from "react";
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
  const {
    url, setUrl, queue, isDownloadingAll, readyCount, doneCount,
    addToQueue, removeFromQueue,
    downloadSingle, downloadAll, clearDone,
  } = useQueue(showStatus, fetchFiles);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <Container maxWidth="md" sx={{ py: 5, pb: 10 }}>
      <AppHeader />
      <UrlInput url={url} setUrl={setUrl} onAdd={addToQueue} />
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
        files={files}
        onDelete={handleDelete}
      />

      {files.length === 0 && queue.length === 0 && <EmptyState />}
    </Container>
  );
}
