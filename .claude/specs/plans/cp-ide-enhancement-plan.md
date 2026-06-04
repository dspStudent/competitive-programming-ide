# CP IDE Enhancement Plan - Expected Output, Settings Redesign & Submission Architecture

## Approved: 2026-06-04

## Deliverables

1. Plan markdown file in .claude/specs/plans/
2. In-progress tracking file in .claude/specs/in-progress/
3. ExpectedOutputPanel.jsx (New Component)
4. OutputPanel.jsx (Modified - comparison logic)
5. SettingsModal.jsx (Rewritten - tabbed UI)
6. App.jsx (Modified - 3-pane layout + new state)
7. constants.js (Modified - new storage keys)
8. App.css (Modified - tabs, radios, comparison badges, diff styles)
9. Updated claudecode-implementation-tracking.md
10. Executed plan markdown file in .claude/specs/plans-executed/

## Implementation Steps

### Step 1: Update constants.js
- Add EXPECTED_OUTPUT, CASE_INSENSITIVE, TRIM_WHITESPACE, IGNORE_BLANK_LINES keys

### Step 2: Create ExpectedOutputPanel.jsx
- Textarea with header, Clear button
- Persists to localStorage

### Step 3: Update OutputPanel.jsx
- Accept expectedOutput + comparison settings props
- Compare actual vs expected when expected is non-empty
- Show Passed/Wrong Answer badges
- Highlight first mismatching line

### Step 4: Update App.jsx
- Add expectedOutput state with localStorage persistence
- Add comparison settings state (caseInsensitive, trimWhitespace, ignoreBlankLines)
- Change right pane from 2-split to 3-split

### Step 5: Rewrite SettingsModal.jsx
- 4 tabs: Execution, Editor, Template, Comparison
- Execution: preset radio buttons for time/memory
- Editor: font slider, tab radio, word wrap toggle, minimap toggle
- Template: Monaco editor
- Comparison: toggles for case-insensitive, trim whitespace, ignore blank lines

### Step 6: Update App.css
- Tab navigation styles
- Radio group / preset button styles
- Slider styles
- Comparison badges (passed/wrong-answer)
- Diff highlight styles
- Expected output panel styles
