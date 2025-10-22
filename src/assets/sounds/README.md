# Sound Assets

This directory will contain audio feedback files for the game.

## Required Sounds

1. **success.mp3** - Played when user answers correctly
   - Should be upbeat and encouraging
   - Duration: ~1-2 seconds
   - Volume: moderate

2. **incorrect.mp3** - Played when user answers incorrectly
   - Should be gentle, not discouraging
   - Duration: ~1 second
   - Volume: soft

## Implementation Notes

- Sounds will be loaded using the Web Audio API
- Files should be in MP3 format for broad browser support
- Consider adding OGG fallbacks for older browsers
- Keep file sizes small (<100KB each) for fast loading
