# Themed World Map

## User-facing result
Replace the long vertical level list with a swipeable world map: one illustrated landscape per phase, ten level markers arranged along a short winding route, and simple previous/next world controls. Keep existing navigation and gameplay features intact.

## Implementation
- Use the new biblical adventure panorama as the map artwork and present distinct orchard, desert, and coastal world scenes as players move through phases.
- Render one phase at a time with all ten levels, completion stars, lock states, current-player marker, phase reward chest, and responsive world navigation.
- Preserve phase/level unlock rules and level launch behavior; adapt automatic positioning, return-from-game, and the scripture “next phase” action to select the corresponding world instead of scrolling vertically.
- Verify map navigation, locked/unlocked levels, phase progression, and desktop/mobile presentation in the running preview.

## Technical details
- Keep persisted progress and game logic unchanged; only replace map presentation and its navigation state.
- Support pointer/touch horizontal swipes and accessible previous/next controls. Keep phase identity one-based for display and zero-based for existing helper/ref arrays.
