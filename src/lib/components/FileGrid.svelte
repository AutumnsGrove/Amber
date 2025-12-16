<script lang="ts">
  import type { StorageFile } from '$types';

  interface Props {
    files: StorageFile[];
    selectedIds?: Set<string>;
    onSelect?: (file: StorageFile) => void;
    onDelete?: (file: StorageFile) => void;
    onDownload?: (file: StorageFile) => void;
    onPreview?: (file: StorageFile) => void;
  }

  let {
    files,
    selectedIds = new Set(),
    onSelect,
    onDelete,
    onDownload,
    onPreview
  }: Props = $props();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('zip') || mimeType.includes('7z')) return '📦';
    if (mimeType.includes('font')) return '🔤';
    if (mimeType.includes('text') || mimeType.includes('markdown')) return '📝';
    return '📁';
  }

  function isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
</script>

<div class="file-grid">
  {#if files.length === 0}
    <div class="empty-state">
      <span class="text-4xl">📂</span>
      <p class="text-gray-500 mt-2">No files found</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {#each files as file (file.id)}
        <div
          class="file-card"
          class:selected={selectedIds.has(file.id)}
          role="button"
          tabindex="0"
          onclick={() => onSelect?.(file)}
          onkeypress={(e) => e.key === 'Enter' && onSelect?.(file)}
        >
          <div
            class="file-preview"
            role="button"
            tabindex="0"
            onclick={(e) => { e.stopPropagation(); onPreview?.(file); }}
            onkeypress={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onPreview?.(file); } }}
          >
            {#if isImage(file.mime_type)}
              <div class="image-placeholder">
                <span class="text-3xl">{getFileIcon(file.mime_type)}</span>
              </div>
            {:else}
              <div class="icon-placeholder">
                <span class="text-3xl">{getFileIcon(file.mime_type)}</span>
              </div>
            {/if}
          </div>

          <div class="file-info">
            <p class="filename" title={file.filename}>{file.filename}</p>
            <p class="file-meta">
              <span>{formatBytes(file.size_bytes)}</span>
              <span>•</span>
              <span>{formatDate(file.created_at)}</span>
            </p>
          </div>

          <div class="file-actions">
            <button
              class="action-btn"
              title="Download"
              onclick={(e) => { e.stopPropagation(); onDownload?.(file); }}
            >
              ⬇️
            </button>
            <button
              class="action-btn danger"
              title="Delete"
              onclick={(e) => { e.stopPropagation(); onDelete?.(file); }}
            >
              🗑️
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .file-grid {
    padding: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    background: #fafafa;
    border-radius: 0.75rem;
  }

  .file-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
  }

  .file-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .file-card.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .file-preview {
    aspect-ratio: 4/3;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-placeholder,
  .icon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .file-info {
    padding: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .filename {
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-meta {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .file-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-top: 1px solid #e5e7eb;
    background: #fafafa;
  }

  .action-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background 0.2s;
  }

  .action-btn:hover {
    background: #e5e7eb;
  }

  .action-btn.danger:hover {
    background: #fee2e2;
  }
</style>
