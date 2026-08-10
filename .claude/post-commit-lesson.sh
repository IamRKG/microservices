#!/bin/bash
# Post-commit lesson trigger for Claude Code
# Reads Bash tool input from stdin, detects git commit, outputs lesson request

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

# Only trigger when a git commit was run
if echo "$COMMAND" | grep -qE "git commit"; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  SCOPE=$(echo "$BRANCH" | tr '_' ' ' | tr '-' ' ')
  COMMIT_MSG=$(git log -1 --format="%s" 2>/dev/null)
  COMMIT_BODY=$(git log -1 --format="%b" 2>/dev/null)
  DIFF=$(git show HEAD --stat 2>/dev/null)
  FULL_DIFF=$(git show HEAD 2>/dev/null)

  cat <<EOF

========================================
BACKEND ENGINEERING LESSON TRIGGERED
Branch: $BRANCH (Learning scope: $SCOPE)
========================================
Commit: $COMMIT_MSG
$COMMIT_BODY

Files changed:
$DIFF

Full diff:
$FULL_DIFF
========================================

The current learning scope is "$SCOPE" (derived from the branch name "$BRANCH").
Focus the lesson specifically on the concepts introduced by this scope/feature.

Please generate a complete backend engineering lesson for this commit using the 17-section structure:

1. What did we build?
2. Why did we build it?
3. How does it work? (step-by-step execution flow)
4. What happens at runtime? (request/response + internal flow)
5. Architecture (where does this fit?)
6. Performance (complexity, latency, CPU, memory, DB, network, bottlenecks)
7. Scalability (behavior at 10 / 1,000 / 100,000 / 1,000,000 users)
8. Security (mechanisms used, attacks prevented, how attacks work)
9. Design Patterns (patterns used, why, when NOT to use)
10. Database Internals (if DB involved, what is the DB doing internally)
11. Real Production System (how companies implement this at scale)
12. Failure Scenarios (DB down, server crash, timeout, duplicate requests, concurrent updates)
13. Alternatives (2-3 alternatives with advantages, disadvantages, when to use)
14. Important Concepts Learned (list of backend/system-design concepts)
15. Interview Perspective (2-3 questions + what a strong answer contains)
16. Senior Engineer Perspective (what an experienced engineer would think about this)
17. What I Should Remember (3-5 most important takeaways from this commit)

Teaching philosophy: Why → How → Trade-off → Failure → Scale → Production
Connect this commit to previously learned concepts and what comes next.
Challenge any assumptions if the implementation has production concerns.
EOF
fi
