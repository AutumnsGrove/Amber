<script lang="ts">
  import type { StorageFile } from '$types';
  import FileList from './FileList.svelte';

  interface Props {
    files: StorageFile[];
    totalSize: number;
    onRestore: (file: StorageFile) => void;
    onDelete: (file: StorageFile) => void;
    onEmptyTrash: () => void;
    loading?: boolean;
  }

  let { files, totalSize, onRestore, onDelete, onEmptyTrash, loading = false }: Props = $props();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  let confirmEmpty = $state(false);
</script>

<div class="trash-bin">
  <div class="header">
    <div>
      <h2 class="text-xl font-semibold flex items-center gap-2">
        🗑️ Trash
      </h2>
      <p class="text-sm text-gray-500 mt-1">
        {files.length} items • {formatBytes(totalSize)}
      </p>
    </div>

    {#if files.length > 0}
      {#if confirmEmpty}
        <div class="flex items-center gap-2">
          <span class="text-sm text-red-600">Are you sure?</span>
          <button
            class="btn btn-danger"
            onclick={() => {
              onEmptyTrash();
              confirmEmpty = false;
            }}
            disabled={loading}
          >
            Yes, Empty Trash
          </button>
          <button class="btn btn-secondary" onclick={() => (confirmEmpty = false)}>
            Cancel
          </button>
        </div>
      {:else}
        <button class="btn btn-danger" onclick={() => (confirmEmpty = true)} disabled={loading}>
          Empty Trash
        </button>
      {/if}
    {/if}
  </div>

  <p class="text-sm text-gray-600 mt-2 mb-4">
    Files in trash are automatically deleted after 30 days.
  </p>

  <FileList {files} showRestore {onRestore} {onDelete} />
</div>

<style>
  .trash-bin {
    padding: 1.5rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
    border: none;
  }

  .btn-danger:hover:not(:disabled) {
    background: #dc2626;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
