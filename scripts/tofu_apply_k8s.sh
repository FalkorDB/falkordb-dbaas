PLAN_PATH=local-k8s
if [ -n "$1" ]; then
  PLAN_PATH=$1
fi
cd ../tofu && tofu apply -state-out=../state/state-k8s $PLAN_PATH