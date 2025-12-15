<script lang="ts">
  import type { QuotaStatus } from '$types';

  interface Props {
    quota: QuotaStatus;
  }

  let { quota }: Props = $props();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const warningColors = {
    none: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-orange-500',
    full: 'bg-red-500'
  };

  const barColor = $derived(warningColors[quota.warning_level]);
</script>

<div class="storage-meter">
  <div class="flex justify-between items-center mb-2">
    <h3 class="text-lg font-semibold">Storage</h3>
    <span class="text-sm text-gray-600">
      {formatBytes(quota.used_bytes)} / {quota.total_gb} GB
    </span>
  </div>

  <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
    <div
      class={`h-full rounded-full transition-all duration-300 ${barColor}`}
      style="width: {Math.min(quota.percentage, 100)}%"
    ></div>
  </div>

  <div class="flex justify-between items-center mt-2">
    <span class="text-sm text-gray-500">{quota.percentage.toFixed(1)}% used</span>
    <span class="text-sm text-gray-500">
      {formatBytes(quota.available_bytes)} available
    </span>
  </div>

  {#if quota.warning_level === 'warning'}
    <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p class="text-sm text-amber-800">
        You're approaching your storage limit. Consider cleaning up unused files or upgrading your
        plan.
      </p>
    </div>
  {:else if quota.warning_level === 'critical'}
    <div class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <p class="text-sm text-orange-800">
        Storage almost full! Large file uploads may be blocked. Free up space soon.
      </p>
    </div>
  {:else if quota.warning_level === 'full'}
    <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">
        Storage full. New uploads are blocked. Delete files or add more storage to continue.
      </p>
    </div>
  {/if}
</div>

<style>
  .storage-meter {
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>
