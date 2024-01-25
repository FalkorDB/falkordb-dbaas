PLAN_PATH=local-aws
if [ -n "$1" ]; then
  PLAN_PATH=$1
fi
cd ../tofu && tofu apply -state-out=../state/state-aws -auto-approve $PLAN_PATH