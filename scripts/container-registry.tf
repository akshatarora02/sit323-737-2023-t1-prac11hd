resource "google_artifact_registry_repository" "container_registry" {
  repository_id = var.app_name
  location      =  var.location
}

output "repository_name" {
  value = google_artifact_registry_repository.container_registry.name
}