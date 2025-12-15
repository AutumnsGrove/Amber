<script lang="ts">
  import type { UsageBreakdown } from '$types';

  interface Props {
    breakdown: UsageBreakdown[];
    totalBytes: number;
  }

  let { breakdown, totalBytes }: Props = $props();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const productColors: Record<string, string> = {
    blog: 'bg-blue-500',
    ivy: 'bg-purple-500',
    profile: 'bg-green-500',
    themes: 'bg-orange-500'
  };

  const productIcons: Record<string, string> = {
    blog: '📝',
    ivy: '📧',
    profile: '👤',
    themes: '🎨'
  };

  const productLabels: Record<string, string> = {
    blog: 'Blog',
    ivy: 'Email (Ivy)',
    profile: 'Profile',
    themes: 'Themes'
  };

  // Group by product
  const byProduct = $derived(() => {
    const grouped: Record<string, { bytes: number; file_count: number; categories: string[] }> = {};

    for (const item of breakdown) {
      if (!grouped[item.product]) {
        grouped[item.product] = { bytes: 0, file_count: 0, categories: [] };
      }
      grouped[item.product].bytes += item.bytes;
      grouped[item.product].file_count += item.file_count;
      if (!grouped[item.product].categories.includes(item.category)) {
        grouped[item.product].categories.push(item.category);
      }
    }

    return Object.entries(grouped)
      .map(([product, data]) => ({
        product,
        ...data,
        percentage: totalBytes > 0 ? (data.bytes / totalBytes) * 100 : 0
      }))
      .sort((a, b) => b.bytes - a.bytes);
  });
</script>

<div class="usage-breakdown">
  <h3 class="text-lg font-semibold mb-4">Usage by Product</h3>

  {#if byProduct().length === 0}
    <p class="text-gray-500 text-sm">No files uploaded yet.</p>
  {:else}
    <div class="space-y-4">
      {#each byProduct() as item}
        <div class="product-row">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">{productIcons[item.product] || '📁'}</span>
              <span class="font-medium">{productLabels[item.product] || item.product}</span>
            </div>
            <div class="text-right">
              <span class="font-medium">{formatBytes(item.bytes)}</span>
              <span class="text-gray-500 text-sm ml-2">({item.file_count} files)</span>
            </div>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              class={`h-full rounded-full ${productColors[item.product] || 'bg-gray-400'}`}
              style="width: {item.percentage}%"
            ></div>
          </div>

          <div class="flex gap-2 mt-2">
            {#each item.categories as category}
              <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {category}
              </span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .usage-breakdown {
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .product-row {
    padding: 0.75rem;
    background: #fafafa;
    border-radius: 0.5rem;
  }
</style>
