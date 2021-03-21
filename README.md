
# TEVEL

## Install
Prerequisites: Nodejs ^v12, make, yarn
```
git clone https://github.com/teveltech/lens.git ~/workspace/lens --depth 1
cd ~/workspace/lens
npm run build:linux
``` 

#### Add to path
~/workspace/lens/dist/linux-unpacked/kontena-lens

- make sure to replace the original lens if installed.
- for example, run this to overwrite the original shortcut (installed with snap):
```
sudo ln -s ~/workspace/lens/dist/linux-unpacked/kontena-lens /snap/bin/kontena-lens -f
``` 

#### Optional - copy previous clusters to the new lens
```
sudo cp ~/snap/kontena-lens/current/.config/Lens/kubeconfigs/* ~/.config/Lens/kubeconfigs
sudo chown -R $(whoami):$(whoami) ~/.config/Lens/kubeconfigs/*
node copy-old-clusters.js
``` 



# Lens | The Kubernetes IDE

[![Build Status](https://dev.azure.com/lensapp/lensapp/_apis/build/status/lensapp.lens?branchName=master)](https://dev.azure.com/lensapp/lensapp/_build/latest?definitionId=1&branchName=master)
[![Releases](https://img.shields.io/github/downloads/lensapp/lens/total.svg)](https://github.com/lensapp/lens/releases?label=Downloads)
[![Chat on Slack](https://img.shields.io/badge/chat-on%20slack-blue.svg?logo=slack&longCache=true&style=flat)](https://join.slack.com/t/k8slens/shared_invite/enQtOTc5NjAyNjYyOTk4LWU1NDQ0ZGFkOWJkNTRhYTc2YjVmZDdkM2FkNGM5MjhiYTRhMDU2NDQ1MzIyMDA4ZGZlNmExOTc0N2JmY2M3ZGI)

Lens provides the full situational awareness for everything that runs in Kubernetes. It's lowering the barrier of entry for people just getting started and radically improving productivity for people with more experience.

The Lens open source project is backed by a number of Kubernetes and cloud native ecosystem pioneers. It's a standalone application for MacOS, Windows and Linux operating systems. Lens is 100% open source and free of charge for any purpose.

[![Screenshot](.github/screenshot.png)](https://www.youtube.com/watch?v=eeDwdVXattc)

## What makes Lens special?

* Amazing usability and end-user experience
* Unified, secure, multi-cluster management on any platform: support for hundreds of clusters
* Standalone application: no need to install anything in-cluster
* Lens installs anywhere, elimanting the need to wrangle credentials
* Real-time cluster state visualization
* Resource utilization charts and trends with history powered by built-in Prometheus
* Smart terminal access to nodes and containers
* Clusters can be local (e.g. minikube) or external (e.g. EKS, GKE, AKS)
* Performance optimized to handle massive clusters (tested with a cluster running 25k pods)
* RBAC security is preserved, as Lens uses the standard Kubernetes API
* Lens Extensions are used to add custom visualizations and functionality to accelerate development workflows for all the technologies and services that integrate with Kubernetes
* Port forwarding
* Helm package deployment: Browse and deploy Helm charts with one click-Install
* Extensions via Lens Extensions API 

## Installation

See [Getting Started](https://docs.k8slens.dev/latest/getting-started/) page.

## Development

See [Development](https://docs.k8slens.dev/latest/contributing/development/) page.

## Contributing

See [Contributing](https://docs.k8slens.dev/latest/contributing/) page.
