<script lang="ts">
  import { tick } from 'svelte';
  import { addBit, commit, clearAccumulation, getAccumulation } from '$lib/stores/accumulatingPost.svelte';
  import { getPreview, isLoading, getError, getCachedPreview } from '$lib/stores/linkPreview.svelte';
  import type { LinkPreview, AccumulableBit } from '@o19/foundframe-front';

  export type InputType = 'text' | 'link' | 'person' | null;

  interface Props {
    activeInput: InputType;
    onClose: () => void;
  }

  let { activeInput, onClose }: Props = $props();

  // Local state bound to drafts (synced with store)
  let textValue = $state('');
  let linkValue = $state('');
  let selectedPerson = $state<{ did: string; displayName: string; avatarUri?: string } | null>(null);

  // Local draft state - independent from accumulation until explicitly added
  // No automatic sync from store - we don't want added bits to reappear as drafts

  // Link preview state
  let currentPreview = $state<LinkPreview | null>(null);
  let previewLoading = $state(false);
  let previewError = $state<string | null>(null);

  // Fetch preview when link input changes (with debounce)
  let debounceTimer: ReturnType<typeof setTimeout>;
  $effect(() => {
    if (activeInput === 'link' && linkValue && !!getValidUrl(linkValue)) {
      clearTimeout(debounceTimer);
      previewLoading = true;
      previewError = null;

      debounceTimer = setTimeout(async () => {
        const url = getValidUrl(linkValue);
        if (!url) return;
        const preview = await getPreview(url);
        if (preview) {
          // Use the imagePath from preview metadata
          const mainImage = preview.imagePath;
          currentPreview = {
            title: preview.title || linkValue,
            description: preview.description,
            imageUri: mainImage,
            siteName: preview.siteName
          };
        }
        previewLoading = false;
      }, 500);
    } else {
      currentPreview = null;
      previewError = null;
    }
  });

  // Auto-focus when activeInput changes
  $effect(() => {
    if (activeInput) {
      tick().then(() => {
        switch (activeInput) {
          case 'text':
            textRef?.focus();
            break;
          case 'link':
            linkRef?.focus();
            break;
          // Person input has buttons, not a text field to focus
        }
      });
    }
  });

  // Refs for auto-focus
  let textRef = $state<HTMLTextAreaElement>();
  let linkRef = $state<HTMLInputElement>();

  // Update local state on input (don't add bit yet)
  function handleTextInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    textValue = target.value;
    autoResize();
  }

  function handleLinkInput(e: Event) {
    const target = e.target as HTMLInputElement;
    linkValue = target.value;
  }

  // Auto-resize textarea
  function autoResize() {
    if (!textRef) return;
    textRef.style.height = 'auto';
    textRef.style.height = Math.min(textRef.scrollHeight, 150) + 'px';
  }

  $effect(() => {
    if (textRef && textValue) {
      autoResize();
    }
  });

  // Computed: can we add current input?
  let canAdd = $derived(() => {
    switch (activeInput) {
      case 'text': return textValue.trim().length > 0;
      case 'link': return !!getValidUrl(linkValue);
      case 'person': return selectedPerson !== null;
      default: return false;
    }
  });

  function getValidUrl(url: string): string | null {
    if (!url.match(/^.*:\/\/.*/) && url.match(/\..{2,}$/)) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  async function handleAdd() {
    switch (activeInput) {
      case 'text':
        if (textValue.trim()) {
          await addBit({ type: 'text', content: textValue });
          textValue = '';
          onClose();
        }
        break;
      case 'link':
        const url = getValidUrl(linkValue);
        if (url) {
          // Use fetched preview or fallback
          const preview = currentPreview || { title: url };
          await addBit({ type: 'link', url, preview });
          linkValue = '';
          currentPreview = null;
          onClose();
        }
        break;
      case 'person':
        if (selectedPerson) {
          // Person already added via selectPerson, just close
          selectedPerson = null;
          onClose();
        }
        break;
    }
  }

  // Person selection
  const mockPeople = [
    { did: 'did:keri:alice', displayName: 'Alice' },
    { did: 'did:keri:bob', displayName: 'Bob' },
    { did: 'did:keri:carol', displayName: 'Carol' },
  ];

  async function selectPerson(person: typeof mockPeople[0]) {
    selectedPerson = person;
    await addBit({
      type: 'person',
      did: person.did,
      displayName: person.displayName
    });
  }
</script>

<div class="input-area" class:visible={activeInput}>
  {#if activeInput === 'text'}
    <div class="input-content">
      <textarea
        bind:this={textRef}
        value={textValue}
        oninput={handleTextInput}
        placeholder="What's on your mind?"
        class="text-input"
        rows="2"
      ></textarea>
    </div>
  {:else if activeInput === 'link'}
    <div class="input-content">
      <input
        bind:this={linkRef}
        type="url"
        value={linkValue}
        oninput={handleLinkInput}
        placeholder="https://..."
        class="link-input"
      />

      {#if previewLoading}
        <div class="link-preview loading">
          <span>Fetching preview...</span>
        </div>
      {:else if previewError}
        <div class="link-preview error">
          <span>⚠️ {previewError}</span>
        </div>
      {:else if currentPreview}
        <div class="link-preview">
          {#if currentPreview.imageUri}
            <img src={currentPreview.imageUri} alt="" class="preview-image" />
          {/if}
          <div class="preview-meta">
            <strong>{currentPreview.title || 'Untitled'}</strong>
            {#if currentPreview.description}
              <span class="preview-desc">{currentPreview.description}</span>
            {/if}
            {#if currentPreview.siteName}
              <span class="preview-site">{currentPreview.siteName}</span>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {:else if activeInput === 'person'}
    <div class="input-content">
      {#if selectedPerson}
        <div class="selected-person">
          <span class="avatar">{selectedPerson.displayName[0]}</span>
          <span class="name">{selectedPerson.displayName}</span>
          <button class="clear-btn" onclick={() => { selectedPerson = null; }}>×</button>
        </div>
      {:else}
        <div class="people-list">
          {#each mockPeople as person}
            <button class="person-option" onclick={() => selectPerson(person)}>
              <span class="avatar">{person.displayName[0]}</span>
              <span>{person.displayName}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if activeInput}
    <div class="add-bar">
      <span class="hint">
        {#if activeInput === 'text'}{textValue.length} chars
        {:else if activeInput === 'link'}{!!getValidUrl(linkValue) ? 'Valid URL' : 'Enter valid URL'}
        {:else if activeInput === 'person'}{selectedPerson ? 'Ready to tag' : 'Select someone'}
        {/if}
      </span>
      <button
        class="add-btn"
        onclick={handleAdd}
        disabled={!canAdd()}
      >
        Add {activeInput}
      </button>
    </div>
  {/if}
</div>

<style>
  .input-area {
    width: 100%;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.3s ease;
    padding: 0 16px;
  }

  .input-area.visible {
    max-height: 280px;
    opacity: 1;
    padding: 16px;
  }

  .input-content {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 12px;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .text-input {
    width: 100%;
    min-height: 60px;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5;
    resize: none;
  }

  .text-input::placeholder {
    color: #999;
  }

  .link-input {
    width: 100%;
    padding: 8px 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 1rem;
  }

  .link-input::placeholder {
    color: #999;
  }

  .link-preview {
    margin-top: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .link-preview.loading {
    color: #888;
    font-size: 0.9rem;
  }

  .link-preview.error {
    color: #c33;
    font-size: 0.9rem;
  }

  .preview-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .preview-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preview-meta strong {
    font-size: 0.95rem;
    color: #333;
  }

  .preview-desc {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.4;
  }

  .preview-site {
    font-size: 0.8rem;
    color: #667eea;
  }

  .selected-person {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border-radius: 24px;
    border: 2px solid #667eea30;
  }

  .people-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .person-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.15s;
    font-size: 0.95rem;
  }

  .person-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .name {
    font-weight: 500;
    color: #333;
  }

  .clear-btn {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    color: #666;
    cursor: pointer;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
  }

  .clear-btn:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  .add-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding: 0 4px;
  }

  .hint {
    font-size: 0.85rem;
    color: #888;
  }

  .add-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }

  .add-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
</style>
