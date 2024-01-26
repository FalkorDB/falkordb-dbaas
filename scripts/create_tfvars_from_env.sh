    echo "name=\"$name\"
    region=\"$region\"
    k8s_version=\"$k8s_version\"
    k8s_instance_type=\"$k8s_instance_type\"
    k8s_node_count=\"$k8s_node_count\"
    k8s_node_min_count=\"$k8s_node_min_count\"
    k8s_node_max_count=\"$k8s_node_max_count\"
    backup_retention_period=\"$backup_retention_period\"
    falkordb_version=\"$falkordb_version\"
    falkordb_cpu=\"$falkordb_cpu\"
    falkordb_memory=\"$falkordb_memory\"
    persistance_size=\"$persistance_size\"
    falkordb_replicas=\"$falkordb_replicas\"
    grafana_admin_password=\"$grafana_admin_password\"
    backup_schedule=\"$backup_schedule\"
    falkordb_domain=\"$falkordb_domain\"
    " > ../tofu/terraform.tfvars
cp ../tofu/terraform.tfvars ../tofu/aws/terraform.tfvars
cp ../tofu/terraform.tfvars ../tofu/k8s/terraform.tfvars