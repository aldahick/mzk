data "google_project" "main" {
  project_id = var.google_project_id
}

# resource "google_cloud_run_service" "omnizart" {
#   project = data.google_project.main.project_id
#   name = "omnizart"
#   location = var.google_region
#   metadata {
#     annotations = {
#       "run.googleapis.com/client-name" = "terraform"
#     }
#   }
#   template {
#     spec {
#       containers {
#         image = "mctlab/omnizart"
#       }
#     }
#   }
# }

resource "google_cloud_run_v2_job" "omnizart" {
  provider = google-beta
  name = "omnizart"
  location = "us-east4"
  launch_stage = "BETA"
  template {
    template {
      containers {
        image = "mctlab/omnizart:latest"
      }
    }
  }
}
