PLAN_PATH=local-k8s
if [ -n "$1" ]; then
  PLAN_PATH=$1
fi
cd ../tofu && tofu apply $PLAN_PATH