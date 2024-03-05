
resource "null_resource" "k8s_credentials" {
  provisioner "local-exec" {
    when    = create
    command = <<EOF
    gcloud container clusters get-credentials ${var.cluster_name} --region ${var.region} --project ${var.project_id}
    # Wait for the GMP operator to be available
    kubectl wait --for=condition=Available --timeout=5m -n gmp-system deployment/gmp-operator
    # Wait for the metrics server to be available
    kubectl wait --for=condition=Available --timeout=5m deployment -n kube-system -l k8s-app=metrics-server
    EOF
  }

}

resource "time_sleep" "sleep" {
  depends_on      = [null_resource.k8s_credentials]
  create_duration = "10s"
}


resource "null_resource" "pod_monitoring" {
  provisioner "local-exec" {
    when    = create
    command = <<EOF
      kubectl apply -f - <<EOF2
apiVersion: monitoring.googleapis.com/v1
kind: ClusterPodMonitoring
metadata:
  name: falkordb-redis
  labels:
    app.kubernetes.io/name: redis
    app.kubernetes.io/part-of: google-cloud-managed-prometheus
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: redis
  endpoints:
  - port: metrics
    interval: 30s
EOF2
    EOF
  }

  depends_on = [time_sleep.sleep]
}
