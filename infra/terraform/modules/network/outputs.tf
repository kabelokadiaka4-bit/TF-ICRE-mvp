# /infra/terraform/modules/network/outputs.tf

output "network_name" {
  value = google_compute_network.vpc_network.name
}

output "subnet_name" {
  value = google_compute_subnetwork.primary_subnet.name
}

output "network_self_link" {
  value = google_compute_network.vpc_network.self_link
}
