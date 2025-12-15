<script lang="ts">
  import type { StorageFile } from '$types';

  interface Props {
    files: StorageFile[];
    selectedIds?: Set<string>;
    onSelect?: (file: StorageFile) => void;
    onSelectAll?: () => void;
    onDelete?: (file: StorageFile) => void;
    onDownload?: (file: StorageFile) => void;
    onRestore?: (file: StorageFile) => void;
    showRestore?: boolean;
  }

  let {
    files,
    selectedIds = new Set(),
    onSelect,
    onSelectAll,
    onDelete,
    onDownload,
    onRestore,
    showRestore = false
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const allSelected = $derived(files.length > 0 && files.every((f) => selectedIds.has(f.id)));
</script>

<div class="file-list">
  {#if files.length === 0}
    <div class="empty-state">
      <span class="text-4xl">📂</span>
      <p class="text-gray-500 mt-2">No files found</p>
    </div>
  {:else}
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left p-3 w-8">
            <input
              type="checkbox"
              checked={allSelected}
              onchange={() => onSelectAll?.()}
              class="rounded"
            />
          </th>
          <th class="text-left p-3">Name</th>
          <th class="text-left p-3 hidden md:table-cell">Product</th>
          <th class="text-left p-3 hidden sm:table-cell">Size</th>
          <th class="text-left p-3 hidden lg:table-cell">Date</th>
          <th class="text-right p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each files as file (file.id)}
          <tr
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            class:bg-blue-50={selectedIds.has(file.id)}
          >
            <td class="p-3">
              <input
                type="checkbox"
                checked={selectedIds.has(file.id)}
                onchange={() => onSelect?.(file)}
                class="rounded"
              />
            </td>
            <td class="p-3">
              <div class="flex items-center gap-2">
                <span class="text-lg">{getFileIcon(file.mime_type)}</span>
                <div>
                  <p class="font-medium text-sm truncate max-w-xs" title={file.filename}>
                    {file.filename}
                  </p>
                  <p class="text-xs text-gray-500 md:hidden">{file.product}</p>
                </div>
              </div>
            </td>
            <td class="p-3 hidden md:table-cell">
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {file.product}
              </span>
            </td>
            <td class="p-3 text-sm text-gray-600 hidden sm:table-cell">
              {formatBytes(file.size_bytes)}
            </td>
            <td class="p-3 text-sm text-gray-600 hidden lg:table-cell">
              {formatDate(file.deleted_at || file.created_at)}
            </td>
            <td class="p-3 text-right">
              <div class="flex gap-1 justify-end">
                {#if showRestore}
                  <button
                    class="action-btn"
                    title="Restore"
                    onclick={() => onRestore?.(file)}
                  >
                    ↩️
                  </button>
                {:else}
                  <button
                    class="action-btn"
                    title="Download"
                    onclick={() => onDownload?.(file)}
                  >
                    ⬇️
                  </button>
                {/if}
                <button
                  class="action-btn danger"
                  title="Delete"
                  onclick={() => onDelete?.(file)}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .file-list {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
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
