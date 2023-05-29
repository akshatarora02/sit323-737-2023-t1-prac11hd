resource "google_artifact_registry_repository" "container_registry" {
  provider = google-beta
  repository_id = var.app_name
  location      =  var.location
  format = "DOCKER"
  project = var.gcp_project

}