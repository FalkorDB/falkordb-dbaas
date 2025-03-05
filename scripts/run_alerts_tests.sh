#!/bin/bash

# Check that promtool is installed
if ! command -v promtool &> /dev/null
then
    echo "promtool could not be found"
    exit 1
fi

mkdir -p observability/rules/tests/rules

# For each file under observability/rules directory, create a temp yaml file and run the tests under observability/rules/tests directory
for file in observability/rules/*.yml
do
  # Create temp rule file under observability/rules/tests directory
  cp $file observability/rules/tests/rules/
  yq eval -i '.groups = .spec.groups | del(.apiVersion, .kind, .metadata, .groups[].params, .spec)' observability/rules/tests/rules/$(basename $file)
done

errors=0
for test_file in observability/rules/tests/*.test.yml
do
  promtool test rules $test_file
  if [ $? -ne 0 ]; then
    errors=$((errors+1))
  fi
done

# Clean up temp files
rm -rf observability/rules/tests/rules

if [ $errors -ne 0 ]; then
  echo "Tests failed"
  exit 1
fi