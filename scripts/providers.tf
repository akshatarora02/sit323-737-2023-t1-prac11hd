# Initialises Terraform providers and sets their version numbers.

provider "google" {
    project = var.gcp_project
    region = var.location
}
data "google_client_config" "default" {}
