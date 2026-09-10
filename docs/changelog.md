# v1.4.2

* **CHANGED:** Improved the plugin settings to work with Obsidian’s settings search.
* **CHANGED:** Increased the minimum supported Obsidian version to 1.13.1.

# v1.4.1

* **ADDED:** Distinct icons for held inputs (directions & buttons).
* **ADDED:** Choose between joystick and arrow icons for motion inputs.
* **ADDED:** A comprehensive guide to all supported notation formats, accessible from `Settings > About` or the `Command Palette`.
* **CHANGED:** Redesigned the settings menu.
* **CHANGED:** Removed the natural-language option to keep input parsing predictable.
* **CHANGED:** Increased Large icon sizes by 25%. Small and Medium icons remain unchanged.
* **CHANGED:** Combo text/icon button css class changed to `.cc-mode-toggle`
* **FIXED:** Corrected the joystick icon used for SPD/360 motions.
* **FIXED:** Standardized the visible spacing between joystick icons in multi-input motions.

# v1.3.4

- **FIXED:** Neutral direction (numpad 5) is no longer rendered as text in icon mode.

# v1.3.3

- **FIXED** Various internal stability improvements and bug fixes.

# v1.3.2

- **CHANGED:** Re-designed the settings pannel and add/edit input modal
- **CHANGED:** Release assets now include GitHub artifact attestation, allowing you to verify the integrity and provenance of each release.

# v1.3.1

- **FIXED:** Parentheses are no longer dropped from notations in icon mode.

# v1.3.0

- **ADDED:** Natural language option. Use full-text phrases like "quarter circle forward LP"
  (recommended to keep disabled unless actively using it to help prevent false positives).
- **CHANGED:** Bumped minimum Obsidian requirement to v1.2.3
- **CHANGED:** Removed styling from notation button, making it easier for user to apply their own.
- **CHANGED:** Large plugin refactor to improve security and maintainability.

# v1.2.1

- **FIXED:** Malformed half circle back (63214) motion icon
- **FIXED:** Icons not applying to notations hidden under collapsed headers / indents
- **ADDED:** Icon support for half circle back forward motion (632146)

# v1.2.0

- **CHANGE:** Increased size of "Large" icons
- **CHANGE:** Text now scales with icon size
- **CHANGE:** "Focus Attack" and "Perfect Parry" added to traditional profile defaults

# v1.1.0

- **NEW:** Custom notation profiles
- **NEW:** Icon size options
- **FIXED:** Icons not rendering properly sometimes
