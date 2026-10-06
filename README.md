# ASHFALL

A solo browser RPG prototype built as a static website.

## Current playable systems

- Full-screen RPG interface
- Persistent local save with `localStorage`
- Interactive world map with discovered and locked regions
- World exploration across Greywood, Cinder Road and Saltmarsh, with hidden future regions
- Interactive NPCs, encounters and story dialogue
- Turn-based combat with HP, MP, armor, crits, magic, guarding, dodge/veil and skills
- XP, level progression, stat growth and gold
- Inventory and equipment
- Rare loot drops
- Skill discovery rather than an exposed full skill tree
- Class discovery with common, rare, epic, legendary and mythic tiers
- Hidden/secret progression hooks
- First branching story thread and codex

## Open locally

Open `index.html` in a browser. No package install or build step is required.

## GitHub Pages

The repository includes a GitHub Actions workflow for deploying the static site to GitHub Pages. After enabling Pages for the repository, pushes to `main` can publish the game.

## Design direction

ASHFALL is intended to grow into a deep solo RPG where the player has to work for knowledge: classes are discovered, skills are learned, rare and apparently terrible classes can hide overpowered mechanics, NPCs remember actions, the world changes through story decisions, and a very large item library creates build experimentation rather than menu-based progression.

The current repository is deliberately a vertical slice. The next layers should expand the underlying content model instead of replacing the front end:

1. A much larger world and region graph
2. 1000+ meaningful items using base items, materials, prefixes, suffixes, unique legendaries and set effects
3. Deep class evolution and hidden class requirements
4. NPC schedules, relationships, reputation and memory
5. Multi-act story with world-state changes and multiple endings
6. Dungeons and mechanically distinct bosses
7. Crafting, enchanting and item synergy systems
8. Art, animation, music and sound design
9. Data-driven content tooling for adding quests, items, enemies and classes quickly
10. Optional cloud saves only after the single-player loop is strong
