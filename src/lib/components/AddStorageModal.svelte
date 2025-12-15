<script lang="ts">
  interface Props {
    open: boolean;
    onClose: () => void;
    onPurchase: (addonType: string) => void;
    currentStorageGb: number;
    loading?: boolean;
  }

  let { open, onClose, onPurchase, currentStorageGb, loading = false }: Props = $props();

  const addons = [
    {
      type: 'storage_10gb',
      gb: 10,
      price: '$1/mo',
      description: 'Great for occasional uploads'
    },
    {
      type: 'storage_50gb',
      gb: 50,
      price: '$4/mo',
      description: 'For regular content creators',
      popular: true
    },
    {
      type: 'storage_100gb',
      gb: 100,
      price: '$7/mo',
      description: 'Best value for heavy users'
    }
  ];

  let selectedAddon = $state<string | null>(null);
</script>

{#if open}
  <div class="modal-overlay" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h2 class="text-xl font-semibold">Add Storage</h2>
        <button class="close-btn" onclick={onClose} aria-label="Close">×</button>
      </div>

      <div class="modal-body">
        <p class="text-gray-600 mb-4">
          Current storage: <strong>{currentStorageGb} GB</strong>
        </p>

        <div class="addons-grid">
          {#each addons as addon}
            <button
              class="addon-card"
              class:selected={selectedAddon === addon.type}
              class:popular={addon.popular}
              onclick={() => (selectedAddon = addon.type)}
            >
              {#if addon.popular}
                <span class="popular-badge">Popular</span>
              {/if}
              <div class="addon-size">+{addon.gb} GB</div>
              <div class="addon-price">{addon.price}</div>
              <div class="addon-desc">{addon.description}</div>
              <div class="addon-total">
                Total: {currentStorageGb + addon.gb} GB
              </div>
            </button>
          {/each}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" onclick={onClose}>Cancel</button>
        <button
          class="btn btn-primary"
          disabled={!selectedAddon || loading}
          onclick={() => selectedAddon && onPurchase(selectedAddon)}
        >
          {loading ? 'Processing...' : 'Continue to Checkout'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 1rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    line-height: 1;
  }

  .close-btn:hover {
    color: #374151;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .addons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .addon-card {
    position: relative;
    padding: 1.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .addon-card:hover {
    border-color: #3b82f6;
  }

  .addon-card.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .addon-card.popular {
    border-color: #8b5cf6;
  }

  .popular-badge {
    position: absolute;
    top: -0.75rem;
    left: 50%;
    transform: translateX(-50%);
    background: #8b5cf6;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
  }

  .addon-size {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .addon-price {
    font-size: 1.125rem;
    font-weight: 600;
    color: #3b82f6;
    margin-top: 0.25rem;
  }

  .addon-desc {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .addon-total {
    font-size: 0.75rem;
    color: #059669;
    margin-top: 0.75rem;
    font-weight: 500;
  }

  .btn {
    padding: 0.75rem 1.5rem;
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

  .btn-primary:hover:not(:disabled) {
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

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
