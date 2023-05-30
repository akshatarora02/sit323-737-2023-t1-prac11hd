# Creates a managed Kubernetes cluster on GCP.

resource "google_service_account" "default" {
  account_id   = "akshat"
  display_name = "akshat"
}

resource "google_container_cluster" "cluster" {
    name                = var.app_name
    location            = var.location
    remove_default_node_pool = true
    initial_node_count       = 1
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  name       = "sit737-nodepool"
  location = var.location
  cluster    = google_container_cluster.cluster.name
  node_count = 1
  

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
resource "kubernetes_namespace" "monitoring" {
  metadata {
        name = "monitoring"
  }
}