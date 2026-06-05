# Multi-File System + Git Push Integration - Plan

## Overview
Add multi-file support with file explorer sidebar, tabs, and git push integration to the CP IDE.

## Implementation Order

1. `server/services/fileService.js` (new) - Workspace file management
2. `server/services/gitService.js` (new) - Git commit & push operations
3. `server/routes/files.js` (new) - REST API for file CRUD
4. `server/routes/git.js` (new) - REST API for git operations
5. `server/index.js` (modify) - Register new routes + init workspace
6. `server/routes/runner.js` (modify) - Accept filename param
7. `client/src/utils/constants.js` (modify) - Add new storage keys
8. `client/src/hooks/useFileSystem.js` (new) - File management hook
9. `client/src/hooks/useGit.js` (new) - Git operations hook
10. `client/src/components/FileExplorer.jsx` (new) - File sidebar
11. `client/src/components/FileTabs.jsx` (new) - Tab bar
12. `client/src/components/Toolbar.jsx` (modify) - Push button
13. `client/src/components/StatusBar.jsx` (modify) - File info
14. `client/src/hooks/useCodeRunner.js` (modify) - Filename param
15. `client/src/components/App.jsx` (major refactor) - 3-pane layout
16. `client/src/styles/App.css` (modify) - New styles

## Deliverables
1. Plan markdown file in .claude/specs/plans/
2. In-progress tracking file in .claude/specs/in-progress/
3. server/services/fileService.js (new)
4. server/services/gitService.js (new)
5. server/routes/files.js (new)
6. server/routes/git.js (new)
7. server/index.js (modified)
8. server/routes/runner.js (modified)
9. client/src/utils/constants.js (modified)
10. client/src/hooks/useFileSystem.js (new)
11. client/src/hooks/useGit.js (new)
12. client/src/components/FileExplorer.jsx (new)
13. client/src/components/FileTabs.jsx (new)
14. client/src/components/Toolbar.jsx (modified)
15. client/src/components/StatusBar.jsx (modified)
16. client/src/hooks/useCodeRunner.js (modified)
17. client/src/components/App.jsx (modified)
18. client/src/styles/App.css (modified)
19. Updated claudecode-implementation-tracking.md
20. Executed plan markdown file in .claude/specs/plans-executed/
