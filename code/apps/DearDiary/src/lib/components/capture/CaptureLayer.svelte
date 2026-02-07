<script lang="ts">
  // Placeholder for camera preview
  // TODO: Integrate actual camera stream via Tauri
</script>

<div class="capture-layer">
  <div class="camera-placeholder">
    <span class="placeholder-text">Camera Preview</span>
  </div>
</div>

<style>
  .capture-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .camera-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-text {
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.5rem;
    font-weight: 300;
  }
</style>
