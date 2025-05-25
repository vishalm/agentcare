---
layout: default
title: Mermaid Diagram Test
description: Testing Mermaid diagram rendering on GitHub Pages
---

# Mermaid Diagram Test

This page tests whether Mermaid diagrams are rendering correctly on GitHub Pages.

## Simple Flowchart Test

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## System Architecture Test

```mermaid
graph TB
    subgraph "Frontend"
        React[React App]
        UI[Material-UI]
    end
    
    subgraph "Backend"
        API[Express API]
        DB[(Database)]
    end
    
    React --> API
    API --> DB
```

## Sequence Diagram Test

```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant DB
    
    User->>App: Make Request
    App->>API: HTTP Call
    API->>DB: Query Data
    DB->>API: Return Data
    API->>App: JSON Response
    App->>User: Display Result
```

If you can see properly rendered diagrams above (not just code blocks), then Mermaid is working correctly!

---

[← Back to Documentation](index.md) | [View on GitHub](https://github.com/vishalm/agentcare) 