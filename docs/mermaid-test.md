---
layout: default
title: "Mermaid Test Page"
description: "Testing Mermaid diagram rendering on GitHub Pages"
---

# Mermaid Test Page

This page tests if Mermaid diagrams are rendering correctly on GitHub Pages.

## Simple Flowchart

<div class="mermaid">
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
</div>

## Sequence Diagram

<div class="mermaid">
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
</div>

## More Complex Example

<div class="mermaid">
graph LR
    A[Hard edge] -->|Link text| B(Round edge)
    B --> C{Decision}
    C -->|One| D[Result one]
    C -->|Two| E[Result two]
</div>

## Class Diagram

<div class="mermaid">
classDiagram
    class Agent {
        +String name
        +String status
        +process()
        +activate()
        +deactivate()
    }
    
    class SupervisorAgent {
        +Array agents
        +coordinate()
        +monitor()
    }
    
    class BookingAgent {
        +createBooking()
        +cancelBooking()
    }
    
    Agent <|-- SupervisorAgent
    Agent <|-- BookingAgent
</div>

## Test Complete

If you can see all the diagrams above rendered properly (not as code), then Mermaid is working correctly!

---

[← Back to Documentation](index.md) 