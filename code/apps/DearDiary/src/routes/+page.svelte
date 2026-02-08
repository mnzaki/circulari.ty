<script lang="ts">
  import CaptureLayer from '$lib/components/capture/CaptureLayer.svelte';
  import ForegroundLayer from '$lib/components/feed/ForegroundLayer.svelte';
</script>

<div class="home-page">
  <!-- Background: Camera Capture Interface -->
  <CaptureLayer />
  
  <!-- Foreground: Creation Tools + Feed -->
  <ForegroundLayer />
</div>

<style>
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .home-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
</style>
