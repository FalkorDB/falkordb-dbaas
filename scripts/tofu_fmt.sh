TOFU_DIR=../tofu
# Check if tofu folder exists
if [ -d "$TOFU_DIR" ]; then
  echo "Running tofu fmt in $TOFU_DIR"
else
    TOFU_DIR=./tofu
fi

cd $TOFU_DIR && tofu fmt
cd aws && tofu fmt
cd ../k8s && tofu fmt
cd ../gcp && tofu fmt -recursive