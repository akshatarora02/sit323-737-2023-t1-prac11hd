# Sets the "backend" used to store Terraform state.
# This is required to make continous delivery work.

terraform {
  backend "gcs" {
    bucket  = "newtubesit737"
    prefix  = "terraform/state"
  }
}
