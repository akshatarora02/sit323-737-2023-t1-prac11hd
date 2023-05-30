terraform {
  required_providers {
    helm = {
      source = "hashicorp/helm"
      version = "2.0.2"
    }
  }
}

provider "helm" {}

resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
}

resource "helm_release" "grafana" {
  name       = "grafana"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "grafana"
}
