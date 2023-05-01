# devops

(**Also**, the "Required APIs" section is still applicable for new Google Cloud projects [i.e. fresh clones].)

## Google Cloud Project

### Required APIs

Make sure to activate the following APIs ([here](https://console.cloud.google.com/apis/dashboard)):

- [Cloud Resource Manager](https://console.cloud.google.com/apis/api/cloudresourcemanager.googleapis.com)
- [Cloud Run Admin](https://console.cloud.google.com/apis/api/run.googleapis.com)

### Terraform Configuration

This section, and the Terraform codebase altogether, ended up being entirely unnecessary; since all of the Google Cloud resources are ephemeral, they're managed via `mzk-api`. This component is therefore included for completeness, and because I don't want to throw all this useful work away.

Set these values in `terraform.tfvars` (after copying from `example.tfvars`):

- `google_credentials_path` relative path to your [Google Cloud credentials file](https://developers.google.com/workspace/guides/create-credentials)
  - These credentials should have the following roles:
    - Cloud Run Admin
    - Storage Object Admin
- `google_project_id` numeric project ID
- `google_region` see the [list](https://cloud.google.com/run/docs/locations) of regions which support Cloud Run
