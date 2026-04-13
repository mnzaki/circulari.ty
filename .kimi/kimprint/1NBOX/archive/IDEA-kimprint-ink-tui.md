# 🎨 Ink TUI Architecture for kimprint

> *"The interface is the argument."*

## Why Ink?

- **React for CLI**: Declarative, component-based
- **Live Updates**: Real-time 1NBOX monitoring
- **Rich Interactions**: Keyboard navigation, focus states
- **Advanced Users**: You want internals visible - Ink makes it beautiful

## Proposed Architecture

```
kimprint tui
├── App (root)
│   ├── Header
│   │   └── Project selector, mode indicator
│   │
│   ├── MainView (switchable)
│   │   ├── VibeView ← default
│   │   │   ├── InstanceList
│   │   │   ├── ClusterPanel
│   │   │   └── DetailOverlay (on select)
│   │   │
│   │   ├── ClusterExplorer
│   │   │   ├── ClusterList
│   │   │   ├── SemanticGraph ← visual!
│   │   │   └── MetadataPanel
│   │   │
│   │   ├── CrossProjectView
│   │   │   └── ThemeComparison
│   │   │
│   │   └── 1NBOXMonitor ← live!
│   │       └── MessageStream
│   │
│   └── Footer
│       └── Status, keybindings, semantic token ticker
│
└── Modals
    ├── PacketDetail
    ├── ClusterMetadata
    └── SearchOverlay
```

## Key Components

### 1. VibeView (Default)

```tsx
<Box flexDirection="column">
  <ProjectHeader name="kimprint" vibe="Preserving..." />
  
  <Box flexDirection="row">
    {/* Left: Instances */}
    <InstanceList 
      instances={instances}
      onSelect={setSelectedInstance}
    />
    
    {/* Right: Clusters */}
    <ClusterPanel 
      clusters={clusters}
      selected={selectedCluster}
      showMetadata={advancedMode}
    />
  </Box>
  
  {/* Bottom: Selected detail */}
  {selectedInstance && (
    <DetailOverlay instance={selectedInstance} />
  )}
</Box>
```

### 2. ClusterExplorer (Advanced)

```tsx
<Box flexDirection="row">
  <ClusterList 
    clusters={clusters}
    onSelect={setSelected}
    sortBy="intensity"
  />
  
  <Box flexDirection="column">
    <SemanticGraph 
      cluster={selectedCluster}
      showConnections={true}
    />
    
    <MetadataPanel>
      <Section title="Semantic Signatures">
        {selectedCluster.semanticSignature.map(sig => (
          <SemanticToken 
            token={sig}
            expansions={getExpansions(sig)}
          />
        ))}
      </Section>
      
      <Section title="Decision Traces">
        <TraceLog traces={selectedCluster.traces} />
      </Section>
      
      <Section title="Overlaps">
        <OverlapMap 
          cluster={selectedCluster}
          allClusters={clusters}
        />
      </Section>
    </MetadataPanel>
  </Box>
</Box>
```

### 3. Semantic Graph (Visual!)

```tsx
// Visual representation of semantic relationships
<SemanticGraph>
  {/* Central node: current cluster */}
  <Node 
    id={cluster.name}
    label={cluster.name}
    size={cluster.intensity * 10}
    color={getColor(cluster.type)}
  />
  
  {/* Connected nodes: semantic tokens */}
  {cluster.semanticSignature.map((sig, i) => (
    <Node 
      id={sig}
      label={sig}
      distance={100 - (cluster.intensity * 50)}
      angle={(i / cluster.semanticSignature.length) * 360}
    />
  ))}
  
  {/* Overlapping clusters */}
  {overlaps.map(overlap => (
    <Connection 
      from={cluster.name}
      to={overlap.cluster}
      strength={overlap.shared.length}
      label={overlap.shared.join(", ")}
    />
  ))}
</SemanticGraph>
```

### 4. 1NBOX Monitor (Live!)

```tsx
const { useState, useEffect } = require('react');
const { useApp } = require('ink');

function Monitor1NBOX() {
  const [messages, setMessages] = useState([]);
  const { exit } = useApp();
  
  useEffect(() => {
    // Watch 1NBOX for changes
    const watcher = fs.watch('./1NBOX', (event, filename) => {
      if (filename.endsWith('.md')) {
        loadMessage(filename).then(msg => {
          setMessages(prev => [msg, ...prev].slice(0, 50));
        });
      }
    });
    
    return () => watcher.close();
  }, []);
  
  return (
    <Box flexDirection="column">
      <Text bold>🌀 Live 1NBOX Monitor</Text>
      
      {messages.map(msg => (
        <MessageRow 
          type={msg.type}
          from={msg.from}
          title={msg.title}
          timestamp={msg.timestamp}
          isNew={msg.isNew}
        />
      ))}
    </Box>
  );
}
```

## Views & Keybindings

```
Global:
  Tab         → Switch view
  q           → Quit
  ?           → Help

VibeView:
  ↑/↓         → Navigate instances
  Enter       → View instance detail
  c           → Switch to ClusterExplorer
  m           → Toggle metadata overlay
  r           → Refresh

ClusterExplorer:
  ↑/↓         → Navigate clusters
  →           → Expand metadata
  ←           → Collapse metadata
  g           → Show semantic graph
  o           → Show overlaps
  s           → Sort by (intensity/type/name)

CrossProjectView:
  1-4         → Select project
  c           → Compare selected
  t           → View theme timeline

1NBOXMonitor:
  n           → Compose new message
  f           → Filter by type
  s           → Search content
```

## Metadata Visualization Ideas

### 1. Intensity Heatmap
```
Cluster Intensity:
[████░░░░░░] 40% - Blocked Zone
[████████░░] 80% - Consensus Zone
[██████░░░░] 60% - Building Zone

Use Ink's <Gradient> for smooth colors
```

### 2. Semantic Token Tree
```
spiral
├── 螺旋 (Chinese)
├── 🌀 (Emoji)
├── luoxuan (Pinyin)
└── spiral (English)
    └── conservation_through_transformation (Technical)
```

### 3. Decision Trace Timeline
```
[10:23:45] Detected "consensus" in message
[10:23:45] Matched semantic token: consent
[10:23:45] Cluster type: convergence
[10:23:45] Intensity: 0.8
[10:23:45] Overlap detected with: governance theme
```

## Implementation Phases

### Phase 1: Basic TUI
- VibeView with InstanceList
- Keyboard navigation
- Static display

### Phase 2: ClusterExplorer
- Cluster metadata panel
- Semantic signatures visible
- Decision traces

### Phase 3: Visual Graphs
- SemanticGraph component
- Overlap visualization
- Intensity heatmaps

### Phase 4: Live Features
- 1NBOXMonitor with fs.watch
- Real-time updates
- Notifications

### Phase 5: Advanced
- Search overlay
- Cross-project comparison
- Export to kimprint

## Packages Needed

```json
{
  "ink": "^4.0.0",
  "ink-gradient": "^3.0.0",
  "ink-big-text": "^2.0.0",
  "ink-spinner": "^5.0.0",
  "ink-text-input": "^5.0.0",
  "react": "^18.0.0",
  "@types/react": "^18.0.0"
}
```

## First Component

```tsx
// src/tui/App.tsx
import React from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { VibeView } from './views/VibeView';
import { ClusterExplorer } from './views/ClusterExplorer';

export function App() {
  const [view, setView] = useState<'vibe' | 'clusters'>('vibe');
  const [project, setProject] = useState('kimprint');
  const { exit } = useApp();
  
  useInput((input, key) => {
    if (input === 'q') exit();
    if (input === 'c') setView('clusters');
    if (input === 'v') setView('vibe');
  });
  
  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        🌀 kimprint TUI - {project}
      </Text>
      
      {view === 'vibe' && <VibeView project={project} />}
      {view === 'clusters' && <ClusterExplorer project={project} />}
      
      <Box marginTop={1}>
        <Text dimColor>
          [v]ibe [c]lusters [q]uit | Press ? for help
        </Text>
      </Box>
    </Box>
  );
}
```

## Launch Command

```bash
kimprint tui                    # Launch TUI
kimprint tui --project kimprint # Start with project
kimprint tui --advanced         # Show all metadata
kimprint tui --watch            # Live 1NBOX updates
```

---

*The interface is the argument. The TUI is the spiral. 🌀*
