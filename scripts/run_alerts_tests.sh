#!/bin/bash

# Check that promtool is installed
if ! command -v promtool &> /dev/null
then
    echo "promtool could not be found"
    exit 1
fi

# skip if there are no tests
if [ ! -d observability/rules/tests ] || [ -z "$( ls -A observability/rules/tests )" ]; then
  echo "No tests found"
  exit 0
fi

mkdir -p observability/rules/tests/rules

# Files to skip during testing - using associative array for O(1) lookup
declare -A SKIP_FILES
SKIP_FILES["containeroom.rules.yml"]=1

# Enable nullglob so the glob expands to nothing if no .yml files exist,
# preventing the loop from executing with a literal pattern
shopt -s nullglob

# For each file under observability/rules directory, create a temp yaml file and run the tests under observability/rules/tests directory
for file in observability/rules/*.yml
do
  filename=$(basename "$file")
  
  # Skip files in the skip list - use -v to check key existence
  if [[ -v SKIP_FILES[$filename] ]]; then
    echo "Skipping alert tests for configured exclusion: $filename"
    continue
  fi
  
  # Create temp rule file under observability/rules/tests directory
  cp "$file" observability/rules/tests/rules/
  yq eval -i '.groups = .spec.groups | del(.apiVersion, .kind, .metadata, .groups[].params, .spec)' "observability/rules/tests/rules/$filename"
done

# Disable nullglob after rule files loop
shopt -u nullglob

errors=0
for test_file in observability/rules/tests/*.test.yml
do
  if ! promtool test rules --debug "$test_file"; then
    errors=$((errors+1))
  fi
done

# Clean up temp files
rm -rf observability/rules/tests/rules

if [ $errors -ne 0 ]; then
  echo "Tests failed"
  exit 1
fi