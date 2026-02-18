<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeApp, isAppInitializing, isAppInitialized, getInitError } from '$lib/stores/app.svelte';
  import ServiceErrorOverlay from '$lib/components/error/ServiceErrorOverlay.svelte';

  interface Props {
    children: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  onMount(async () => {
    // Initialize app (database, services, initial data)
    try {
      await initializeApp();
    } catch (err) {
      console.error('Failed to initialize app:', err);
    }
  });

  const initializing = $derived(isAppInitializing());
  const initialized = $derived(isAppInitialized());
  const error = $derived(getInitError());
</script>

{#if initializing}
  <div class="loading-screen">
    <div class="spinner"></div>
    <p>Loading DearDiary...</p>
  </div>
{:else if error}
  <div class="error-screen">
    <h2>Failed to start</h2>
    <p>{error}</p>
    <button onclick={() => location.reload()}>Retry</button>
  </div>
{:else}
  {@render children()}
{/if}

<!-- Fatal error overlay for service connection failures -->
<ServiceErrorOverlay />

<style>
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .loading-screen, .error-screen {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 20px;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-screen h2 {
    margin: 0 0 12px;
  }

  .error-screen p {
    margin: 0 0 24px;
    opacity: 0.9;
  }

  .error-screen button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: white;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s;
  }

  .error-screen button:hover {
    transform: scale(1.05);
  }
</style>
