import { navigate } from "../../navigation";
import { commandRegistry } from "../../../extensions/registries/command-registry";
import { clusterSettingsURL } from "./cluster-settings.route";
import { getHostedClusterId } from "../../../common/cluster-store";

commandRegistry.add({
  id: "cluster.viewCurrentClusterSettings",
  title: "Cluster: View Settings",
  scope: "global",
  action: () => navigate(clusterSettingsURL({
    params: {
      clusterId: getHostedClusterId(),
    }
  })),
  isActive: (context) => !!context.cluster
});
