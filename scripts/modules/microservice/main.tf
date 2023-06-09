variable "app_version" {}
variable "service_name" {}

variable "dns_name" {
    default = ""
}

variable "repo_name" {}

variable "service_type" {
    default = "ClusterIP"
}

variable "session_affinity" {
    default = "ClientIP"
}

variable "env" {
    default = {}
    type = map(string)
}

locals {
    image_tag = "${var.repo_name}/${var.service_name}:${var.app_version}"
}

resource "null_resource" "docker_build" {

    triggers = {
        always_run = timestamp()
    }

    provisioner "local-exec" {
        command = "docker build -t ${local.image_tag} --file ../${var.service_name}/Dockerfile-prod ../${var.service_name}"
    }
}

resource "null_resource" "docker_login" {

    depends_on = [ null_resource.docker_build ]

    triggers = {
        always_run = timestamp()
    }

    provisioner "local-exec" {
        command = "gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://australia-southeast1-docker.pkg.dev"
        
        }
}
resource "null_resource" "docker_push" {

    depends_on = [ null_resource.docker_login ]
    triggers = {
        always_run = timestamp()
    }

    provisioner "local-exec" {
        command = "docker push ${local.image_tag}"
    }
}

resource "kubernetes_deployment" "service_deployment" {

    depends_on = [ null_resource.docker_push ]

    metadata {
        name = var.service_name

    labels = {
            pod = var.service_name
        }
    }

    spec {
        replicas = 1

        selector {
            match_labels = {
                pod = var.service_name
            }
        }

        template {
            metadata {
                labels = {
                    pod = var.service_name
                }
            }

            spec {
                container {
                    image = local.image_tag
                    name  = var.service_name

                    env {
                        name = "PORT"
                        value = "80"
                    }

                    dynamic "env" {
                        for_each = var.env
                        content {
                          name = env.key
                          value = env.value
                        }
                    }
               }
            }
        }
    }
}

resource "kubernetes_service" "service" {
    metadata {
        name = var.dns_name != "" ? var.dns_name : var.service_name
    }

    spec {
        selector = {
            pod = kubernetes_deployment.service_deployment.metadata[0].labels.pod
        }   

        session_affinity = var.session_affinity

        port {
            port        = 80
            target_port = 80
        }

        type             = var.service_type
    }
}
