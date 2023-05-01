# mzk-runner

A wrapper around Omnizart, providing an interface via Google Cloud Storage.

## Setup

Install [Docker](https://www.docker.com). Build a local image: `docker build -t mzk-runner:local .` and start it: `docker run -d --name mzk-runner mzk-runner:local`.

If you want to run the Python script directly, or use `mzk-api` locally, install [Python 3](https://python.org) and [Omnizart](https://pypi.org/project/omnizart/) (make sure to download checkpoints!)
