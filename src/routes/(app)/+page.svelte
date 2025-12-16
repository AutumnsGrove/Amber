<script lang="ts">
  import { onMount } from 'svelte';
  import StorageMeter from '$lib/components/StorageMeter.svelte';
  import UsageBreakdown from '$lib/components/UsageBreakdown.svelte';
  import FileGrid from '$lib/components/FileGrid.svelte';
  import FileList from '$lib/components/FileList.svelte';
  import TrashBin from '$lib/components/TrashBin.svelte';
  import AddStorageModal from '$lib/components/AddStorageModal.svelte';
  import * as api from '$lib/api';
  import type { QuotaStatus, UsageBreakdown as UsageBreakdownType, StorageFile } from '$types';

  // State
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Storage data
  let quota = $state<QuotaStatus | null>(null);
  let breakdown = $state<UsageBreakdownType[]>([]);
  let files = $state<StorageFile[]>([]);
  let totalFiles = $state(0);
  let trashFiles = $state<StorageFile[]>([]);
  let trashSize = $state(0);

  // UI state
  let activeTab = $state<'files' | 'trash'>('files');
  let viewMode = $state<'grid' | 'list'>('grid');
  let selectedIds = $state<Set<string>>(new Set());
  let showAddStorageModal = $state(false);
  let productFilter = $state<string>('');
  let searchQuery = $state('');
  let sortBy = $state<'created_at' | 'size_bytes' | 'filename'>('created_at');
  let sortOrder = $state<'asc' | 'desc'>('desc');

  // Load data
  async function loadData() {
    loading = true;
    error = null;

    try {
      const [storageRes, filesRes, trashRes] = await Promise.all([
        api.getStorageInfo(),
        api.getFiles({ product: productFilter || undefined, search: searchQuery || undefined, sort: sortBy, order: sortOrder }),
        api.getTrash()
      ]);

      if (storageRes.error) throw new Error(storageRes.error);
      if (filesRes.error) throw new Error(filesRes.error);
      if (trashRes.error) throw new Error(trashRes.error);

      quota = storageRes.data!.quota;
      breakdown = storageRes.data!.breakdown;
      files = filesRes.data!.files;
      totalFiles = filesRes.data!.total;
      trashFiles = trashRes.data!.files;
      trashSize = trashRes.data!.total_size;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  // File actions
  async function handleDelete(file: StorageFile) {
    const res = await api.deleteFile(file.id);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadData();
  }

  async function handleRestore(file: StorageFile) {
    const res = await api.restoreFile(file.id);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadData();
  }

  async function handlePermanentDelete(file: StorageFile) {
    if (!confirm(`Permanently delete "${file.filename}"? This cannot be undone.`)) return;

    const res = await api.permanentlyDeleteFile(file.id);
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadData();
  }

  async function handleEmptyTrash() {
    const res = await api.emptyTrash();
    if (res.error) {
      alert(res.error);
      return;
    }
    await loadData();
  }

  function handleDownload(file: StorageFile) {
    const url = api.getDownloadUrl(file.r2_key);
    window.open(url, '_blank');
  }

  function handleSelect(file: StorageFile) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(file.id)) {
      newSelected.delete(file.id);
    } else {
      newSelected.add(file.id);
    }
    selectedIds = newSelected;
  }

  function handleSelectAll() {
    if (selectedIds.size === files.length) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(files.map((f) => f.id));
    }
  }

  async function handlePurchaseAddon(addonType: string) {
    const res = await api.purchaseAddon(addonType);
    if (res.error) {
      alert(res.error);
      return;
    }
    // Redirect to checkout
    if (res.data?.redirect_url) {
      window.location.href = res.data.redirect_url;
    }
    showAddStorageModal = false;
  }

  // Reactive search/filter
  $effect(() => {
    // Re-fetch when filters change
    if (!loading) {
      loadData();
    }
  });

  onMount(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>Amber - Storage Management</title>
</svelte:head>

<div class="dashboard">
  <header class="header">
    <div>
      <h1 class="text-2xl font-bold">Amber</h1>
      <p class="text-gray-600">Your Grove storage, organized</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick={() => loadData()}>
        🔄 Refresh
      </button>
      <button class="btn btn-primary" onclick={() => (showAddStorageModal = true)}>
        + Add Storage
      </button>
    </div>
  </header>

  {#if error}
    <div class="error-banner">
      <span>⚠️ {error}</span>
      <button onclick={() => (error = null)}>×</button>
    </div>
  {/if}

  {#if loading && !quota}
    <div class="loading">
      <span class="spinner"></span>
      <p>Loading your storage...</p>
    </div>
  {:else if quota}
    <div class="overview">
      <div class="overview-left">
        <StorageMeter {quota} />
      </div>
      <div class="overview-right">
        <UsageBreakdown {breakdown} totalBytes={quota.used_bytes} />
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab"
        class:active={activeTab === 'files'}
        onclick={() => (activeTab = 'files')}
      >
        📁 Files ({totalFiles})
      </button>
      <button
        class="tab"
        class:active={activeTab === 'trash'}
        onclick={() => (activeTab = 'trash')}
      >
        🗑️ Trash ({trashFiles.length})
      </button>
    </div>

    {#if activeTab === 'files'}
      <div class="toolbar">
        <div class="toolbar-left">
          <input
            type="search"
            placeholder="Search files..."
            bind:value={searchQuery}
            class="search-input"
          />
          <select bind:value={productFilter} class="filter-select">
            <option value="">All Products</option>
            <option value="blog">Blog</option>
            <option value="ivy">Email (Ivy)</option>
            <option value="profile">Profile</option>
            <option value="themes">Themes</option>
          </select>
        </div>
        <div class="toolbar-right">
          <select bind:value={sortBy} class="filter-select">
            <option value="created_at">Date</option>
            <option value="size_bytes">Size</option>
            <option value="filename">Name</option>
          </select>
          <button
            class="view-btn"
            class:active={viewMode === 'grid'}
            onclick={() => (viewMode = 'grid')}
            title="Grid view"
          >
            ▦
          </button>
          <button
            class="view-btn"
            class:active={viewMode === 'list'}
            onclick={() => (viewMode = 'list')}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {#if viewMode === 'grid'}
        <FileGrid
          {files}
          {selectedIds}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      {:else}
        <FileList
          {files}
          {selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      {/if}
    {:else}
      <TrashBin
        files={trashFiles}
        totalSize={trashSize}
        onRestore={handleRestore}
        onDelete={handlePermanentDelete}
        onEmptyTrash={handleEmptyTrash}
      />
    {/if}
  {/if}
</div>

<AddStorageModal
  open={showAddStorageModal}
  onClose={() => (showAddStorageModal = false)}
  onPurchase={handlePurchaseAddon}
  currentStorageGb={quota?.total_gb ?? 0}
/>

<style>
  .dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .error-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    color: #dc2626;
  }

  .error-banner button {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #dc2626;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .overview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .overview {
      grid-template-columns: 1fr;
    }
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tab {
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.2s;
  }

  .tab:hover {
    color: #374151;
  }

  .tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .search-input {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    width: 250px;
  }

  .filter-select {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: white;
  }

  .view-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    border-radius: 0.5rem;
    font-size: 1rem;
  }

  .view-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }
</style>
