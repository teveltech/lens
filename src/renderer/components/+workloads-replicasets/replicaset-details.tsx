import "./replicaset-details.scss";
import React from "react";
import { reaction } from "mobx";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { replicaSetStore } from "./replicasets.store";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "../+events/kube-event-details";
import { disposeOnUnmount, observer } from "mobx-react";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "../kube-object";
import { ReplicaSet } from "../../api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { ResourceType } from "../+cluster-settings/components/cluster-metrics-setting";
import { getHostedCluster } from "../../../common/cluster-store";

interface Props extends KubeObjectDetailsProps<ReplicaSet> {
}

@observer
export class ReplicaSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    replicaSetStore.reset();
  });

  async componentDidMount() {
    podsStore.reloadAll();
  }

  componentWillUnmount() {
    replicaSetStore.reset();
  }

  render() {
    const { object: replicaSet } = this.props;

    if (!replicaSet) return null;
    const { metrics } = replicaSetStore;
    const { status } = replicaSet;
    const { availableReplicas, replicas } = status;
    const selectors = replicaSet.getSelectors();
    const nodeSelector = replicaSet.getNodeSelectors();
    const images = replicaSet.getImages();
    const childPods = replicaSetStore.getChildPods(replicaSet);
    const isMetricHidden = getHostedCluster().isMetricHidden(ResourceType.ReplicaSet);

    return (
      <div className="ReplicaSetDetails">
        {!isMetricHidden && podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => replicaSetStore.loadMetrics(replicaSet)}
            tabs={podMetricTabs} object={replicaSet} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={replicaSet}/>
        {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        <DrawerItem name="Replicas">
          {`${availableReplicas || 0} current / ${replicas || 0} desired`}
        </DrawerItem>
        <PodDetailsTolerations workload={replicaSet}/>
        <PodDetailsAffinities workload={replicaSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={replicaSet}/>
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "ReplicaSet",
  apiVersions: ["apps/v1"],
  components: {
    Details: (props: any) => <ReplicaSetDetails {...props} />
  }
});
kubeObjectDetailRegistry.add({
  kind: "ReplicaSet",
  apiVersions: ["apps/v1"],
  priority: 5,
  components: {
    Details: (props: any) => <KubeEventDetails {...props} />
  }
});
