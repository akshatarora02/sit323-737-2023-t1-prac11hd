# Initialises Terraform providers and sets their version numbers.

provider "google" {
    project = var.gcp_project
    region = var.location
}
data "google_client_config" "default" {}

provider "kubernetes" {
  config_path = data.external.kubeconfig.result.kubeconfig_path
  host  = google_container_cluster.cluster.endpoint
  token = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.cluster.master_auth[0].cluster_ca_certificate,
  )
}