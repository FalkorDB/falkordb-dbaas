STATE_PATH=local
if [ -n "$1" ]; then
  STATE_PATH=$1
fi
cd ../tofu && tofu show -json $STATE_PATH