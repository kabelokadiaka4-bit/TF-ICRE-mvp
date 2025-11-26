# /infra/terraform/modules/vpc-connector/main.tf

resource "google_vpc_access_connector" "connector" {
  name          = var.connector_name
  region        = var.region
  project       = var.project_id
  network       = var.network_name
  ip_cidr_range = var.ip_cidr_range
  min_throughput = var.min_throughput
  max_throughput = var.max_throughput

  depends_on = [
    # Ensure the VPC network and subnetwork are created first
    # This is handled implicitly if network module is called before this in environment
  ]
}
