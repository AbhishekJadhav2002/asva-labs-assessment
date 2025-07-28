read_env() {
  local filePath="${1:-.env}"
  while IFS= read -r LINE || [[ -n "$LINE" ]]; do
    CLEAN=$(echo "$LINE" | awk '{$1=$1};1' | tr -d '\r')
    [[ "$CLEAN" =~ ^#.*$ ]] && continue
    [[ "$CLEAN" =~ '=' ]] && export "$CLEAN"
  done < "$filePath"
}