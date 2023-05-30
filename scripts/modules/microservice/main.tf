variable "app_version" {}
variable "service_name" {}

variable "dns_name" {
    default = ""
}

variable "repo_name" {}

locals {
    image_tag = "${var.repo_name}/${var.service_name}:${var.app_version}"
}

resource "null_resource" "docker_build" {

    triggers = {
        always_run = timestamp()
    }

    provisioner "local-exec" {
        command = "docker build -t ${local.image_tag} --file ../${var.service_name}/Dockerfile-dev ../${var.service_name}"
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

