#!/bin/bash
# Pre-commit hook for Claude Code
# Runs type check + tests, then triggers code review before commit

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

# Only trigger when a git commit is about to run
if echo "$COMMAND" | grep -qE "git commit"; then

  echo "========================================"
  echo "PRE-COMMIT CHECKS"
  echo "========================================"

  # 1. TypeScript type check
  echo ""
  echo "--- TypeScript Check ---"
  if npx tsc --noEmit 2>&1; then
    echo "✓ TypeScript: passed"
  else
    echo "✗ TypeScript: FAILED — fix type errors before committing"
    exit 1
  fi

  # 2. Lint check (if eslint is configured)
  if [ -f "eslint.config.js" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
    echo ""
    echo "--- ESLint Check ---"
    if npx eslint . 2>&1; then
      echo "✓ ESLint: passed"
    else
      echo "✗ ESLint: FAILED — fix lint errors before committing"
      exit 1
    fi
  fi

  # 3. Run tests (if vitest is configured)
  if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
    echo ""
    echo "--- Test Suite ---"
    if npx vitest run 2>&1; then
      echo "✓ Tests: passed"
    else
      echo "✗ Tests: FAILED — fix failing tests before committing"
      exit 1
    fi
  fi

  echo ""
  echo "========================================"
  echo "All checks passed. Proceeding to code review..."
  echo "========================================"

  # Code review of staged diff
  STAGED_DIFF=$(git diff --cached 2>/dev/null)
  STAGED_FILES=$(git diff --cached --name-only 2>/dev/null)

  if [ -z "$STAGED_DIFF" ]; then
    exit 0
  fi

  cat <<EOF

========================================
CODE REVIEW — STAGED CHANGES
========================================
Files staged:
$STAGED_FILES

Staged diff:
$STAGED_DIFF
========================================

Please perform a thorough code review of the staged changes above. Structure your review as follows:

## Code Review

### Overall Assessment
One-line verdict: Approve / Approve with suggestions / Request changes

### Issues Found
For each issue, specify:
- **Severity**: Critical | High | Medium | Low | Suggestion
- **File & Line**: where the issue is
- **Problem**: what is wrong
- **Fix**: how to correct it

Categories to check:
- **Correctness** — logic errors, edge cases, off-by-one, null/undefined handling
- **Security** — injection, exposed secrets, missing validation, insecure headers, auth issues
- **Performance** — N+1 queries, missing indexes, unnecessary loops, blocking I/O, memory leaks
- **TypeScript** — type safety, missing types, any usage, improper error handling
- **Express/Node.js** — middleware order, async/await correctness, unhandled promise rejections
- **Database** — missing transactions, unsafe queries, missing constraints
- **Code Quality** — naming, duplication, single responsibility, dead code
- **Best Practices** — REST conventions, HTTP status codes, error response format

### Positive Observations
What was done well.

### Recommendation
Should we proceed with this commit, or fix issues first?
EOF
fi
