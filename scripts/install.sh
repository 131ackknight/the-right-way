#!/usr/bin/env bash
# Install The Right Way skills (the-right-way, next-slice) for Claude Code, Cursor, and/or Codex.
set -euo pipefail

SKILLS=(the-right-way next-slice)
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [targets] [options]

Targets (default: every tool detected in your home directory, or Claude Code if none):
  --claude      ~/.claude/skills        (project: .claude/skills)
  --cursor      ~/.cursor/skills        (project: .cursor/skills)
  --codex       ~/.agents/skills        (project: .agents/skills)
  --all         all of the above

Options:
  --project     install into the current directory instead of your home directory
  --link        symlink instead of copy, so `git pull` updates the skills
  --uninstall   remove the skills from the selected targets
  -h, --help    show this help
EOF
}

targets=()
scope_root="$HOME"
mode="copy"
action="install"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude) targets+=(claude) ;;
    --cursor) targets+=(cursor) ;;
    --codex) targets+=(codex) ;;
    --all) targets+=(claude cursor codex) ;;
    --project) scope_root="$PWD" ;;
    --link) mode="link" ;;
    --uninstall) action="uninstall" ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

for skill in "${SKILLS[@]}"; do
  if [[ ! -f "$REPO_DIR/skills/$skill/SKILL.md" ]]; then
    echo "Cannot find skills/$skill/SKILL.md. Run this script from a clone of the repo." >&2
    exit 1
  fi
done

if [[ ${#targets[@]} -eq 0 ]]; then
  [[ -d "$scope_root/.claude" ]] && targets+=(claude)
  [[ -d "$scope_root/.cursor" ]] && targets+=(cursor)
  [[ -d "$scope_root/.agents" || -d "$scope_root/.codex" ]] && targets+=(codex)
  [[ ${#targets[@]} -eq 0 ]] && targets+=(claude)
fi

skills_dir_for() {
  case "$1" in
    claude) echo "$scope_root/.claude/skills" ;;
    cursor) echo "$scope_root/.cursor/skills" ;;
    codex) echo "$scope_root/.agents/skills" ;;
  esac
}

label_for() {
  case "$1" in
    claude) echo "Claude Code" ;;
    cursor) echo "Cursor" ;;
    codex) echo "Codex" ;;
  esac
}

skill_list="$(IFS=,; echo "${SKILLS[*]}")"
seen=" "
for target in "${targets[@]}"; do
  [[ "$seen" == *" $target "* ]] && continue
  seen+="$target "

  dest_root="$(skills_dir_for "$target")"
  for skill in "${SKILLS[@]}"; do
    dest="$dest_root/$skill"
    if [[ "$action" == "uninstall" ]]; then
      rm -rf "$dest"
      continue
    fi
    mkdir -p "$dest_root"
    rm -rf "$dest"
    if [[ "$mode" == "link" ]]; then
      ln -s "$REPO_DIR/skills/$skill" "$dest"
    else
      cp -R "$REPO_DIR/skills/$skill" "$dest"
    fi
  done

  if [[ "$action" == "uninstall" ]]; then
    echo "Removed from $(label_for "$target"): $dest_root/{$skill_list}"
  else
    echo "Installed for $(label_for "$target") ($mode): $dest_root/{$skill_list}"
  fi
done

if [[ "$action" == "install" ]]; then
  cat <<'EOF'

Start a new chat and say:
  Use the-right-way to plan <what you want to build>.
EOF
fi
