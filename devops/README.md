# devops

## Google Cloud Project

Make sure to activate the following APIs ([here](https://console.cloud.google.com/apis/dashboard)):

- [Cloud Resource Manager](https://console.cloud.google.com/apis/api/cloudresourcemanager.googleapis.com)
- [Cloud Run Admin](https://console.cloud.google.com/apis/api/run.googleapis.com)

Set these values in `terraform.tfvars` (after copying from `example.tfvars`):

- `google_credentials_path` relative path to your [Google Cloud credentials file](https://developers.google.com/workspace/guides/create-credentials)
  - These credentials should have the following roles:
    - Cloud Run Admin
    - Storage Object Admin
- `google_project_id` numeric project ID
- `google_region` see the [list](https://cloud.google.com/run/docs/locations) of regions which support Cloud Run
