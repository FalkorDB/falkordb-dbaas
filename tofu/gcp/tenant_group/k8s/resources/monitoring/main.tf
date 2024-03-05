resource "null_resource" "pod_monitoring" {
  provisioner "local-exec" {
    when    = create
    command = <<EOF
      gcloud container clusters get-credentials ${var.cluster_name} --region ${var.region} --project ${var.project_id}
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
}
