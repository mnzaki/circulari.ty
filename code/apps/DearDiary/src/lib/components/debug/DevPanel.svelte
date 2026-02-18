<script lang="ts">
  let value = $state('');

  function handleSubmit() {
  }
</script>

<div>
  <input bind:value={value} />
  <button onclick={handleSubmit}>Add Bootstrap Node</button>
</div>

<style></style>
