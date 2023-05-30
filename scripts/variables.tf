# Sets global variables for this Terraform project.
variable "gcp_project" {
  default = "sit737-23t1-arora-5acc5a5"
}
variable app_name {
    default = "newtube"
}
variable location {
  default = "australia-southeast2"
}

variable "bucket-name" {
  type        = string
  description = "The name of the Google Storage Bucket to create"
  default = "newtubesit737"
}

variable app_version { 
  default = 1
}

