<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    children: Snippet;
    fallback?: Snippet<[{ error: Error; reset: () => void }]>;
  }
  
  let { children, fallback }: Props = $props();
  
  let error = $state<Error | null>(null);
  let errorInfo = $state('');
  
  function handleError(err: unknown, resetFn: () => void) {
    console.error('ErrorBoundary caught:', err);
    error = err instanceof Error ? err : new Error(String(err));
    errorInfo = '';
  }
  
  function reset() {
    error = null;
    errorInfo = '';
  }
</script>

<svelte:boundary onerror={handleError}>
  {#if error}
    {#if fallback}
      {@render fallback({ error, reset })}
    {:else}
      <div class="error-fallback">
        <h3>Something went wrong</h3>
        <p class="error-message">{error.message}</p>
        {#if errorInfo}
          <pre class="error-info">{errorInfo}</pre>
        {/if}
        <button onclick={reset}>Try again</button>
      </div>
    {/if}
  {:else}
    {@render children()}
  {/if}
</svelte:boundary>

<style>
  .error-fallback {
    padding: 1rem;
    margin: 0.5rem 0;
    border: 1px solid #ff4444;
    border-radius: 8px;
    background: rgba(255, 68, 68, 0.1);
  }
  
  .error-fallback h3 {
    margin: 0 0 0.5rem 0;
    color: #ff4444;
  }
  
  .error-message {
    margin: 0 0 0.5rem 0;
    color: #cc0000;
  }
  
  .error-info {
    font-size: 0.75rem;
    color: #666;
    overflow-x: auto;
    background: rgba(0, 0, 0, 0.05);
    padding: 0.5rem;
    border-radius: 4px;
  }
  
  button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #cc0000;
  }
</style>
