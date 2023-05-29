locals {
    repo_name = google_artifact_registry_repository.container_registry.name
    rabbit = "amqp://guest:guest@rabbit:5672"
    database = "mongodb://db:27017"
}

module "gateway-microservice" {
    source ="./modules/microservice"
    service_name = "gateway"
    service_type = "LoadBalancer"
    session_affinity = "ClientIP"
    repo_name = local.repo_name
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
    }
}

module "video-streaming-microservice" {
    source ="./modules/microservice"
    service_name = "video-streaming"
    repo_name = local.repo_name
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
    }
}

module "video-upload-microservice" {
    source ="./modules/microservice"
    service_name = "video-upload"
    repo_name = local.repo_name
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
    }
}

module "video-storage-microservice" {
    source ="./modules/microservice"
    service_name = "video-storage"
    dns_name = "video-storage"
    repo_name = local.repo_name
    app_version = var.app_version
}

module "metadata-microservice" {
    source ="./modules/microservice"
    service_name = "metadata"
    repo_name = local.repo_name
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
        DBHOST: local.database
        DBNAME: "metadata"
    }
}

