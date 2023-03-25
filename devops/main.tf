terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "~> 4.58.0"
    }
    google-beta = {
      source = "hashicorp/google-beta"
      version = "~> 4.58.0"
    }
  }
}

provider "google" {
  project = var.google_project_id
  credentials = var.google_credentials_path
}

provider "google-beta" {
  project = var.google_project_id
  credentials = var.google_credentials_path
}

module "omnizart" {
  source = "./omnizart"
  google_project_id = var.google_project_id
  google_region = var.google_region
}
