# Architecture

## Design goals

NPC Forge separates generation, Foundry/PF2e document materialization, content registration, and user interfaces. The engine has no UI dependency and does not create Foundry documents.

## Layers

1. **NPC Engine** — normalizes generation requests and produces a neutral NPC model.
2. **Content Registry** — stores core and externally registered content under stable IDs.
3. **PF2e Document Adapter** — converts neutral NPC data to PF2e Actor sources and creates Actors.
4. **Public API** — exposes engine, adapter, content registration, capabilities, and editor sessions.
5. **Editor UI** — standalone or embedded client of the same engine/API.

## Data flow

`Generation Request -> NpcEngine -> Neutral NPC Model -> Pf2eDocumentAdapter -> Foundry Actor`

The standalone GUI is deliberately not part of that data flow.

## Extension boundary

External modules must use `game.modules.get("pf2e-npc-forge").api`. Internal file paths and application classes are not public contracts.
