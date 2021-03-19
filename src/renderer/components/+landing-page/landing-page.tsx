import "./landing-page.scss";
import React from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { clusterStore } from "../../../common/cluster-store";
import { WorkspaceId, workspaceStore } from "../../../common/workspace-store";
import { WorkspaceOverview } from "./workspace-overview";
import { PageLayout } from "../layout/page-layout";
import { Notifications } from "../notifications";
import { Icon } from "../icon";
import { createStorage } from "../../utils";

export const landingPageStorage = createStorage<WorkspaceId[]>("landing_page", []);

@observer
export class LandingPage extends React.Component {
  @computed get workspace() {
    return workspaceStore.currentWorkspace;
  }

  @computed get workspaceClusters() {
    return clusterStore.getByWorkspaceId(this.workspace.id);
  }

  componentDidMount() {
    const workspacesSeen = new Set(landingPageStorage.get());

    if (!workspacesSeen.has(this.workspace.id) && this.workspaceClusters.length === 0 && !this.workspace.isManaged) {
      Notifications.info(<><b>Welcome!</b><p>Get started by associating one or more clusters to Lens</p></>, {
        timeout: 30_000,
        id: "landing-welcome"
      });
    }

    workspacesSeen.add(this.workspace.id);
    landingPageStorage.set(Array.from(workspacesSeen));
  }

  render() {
    const showBackButton = Boolean(this.workspace.activeClusterId);
    const header = <><Icon svg="logo-lens" big /> <h2>{this.workspace.name}</h2></>;

    return (
      <PageLayout className="LandingOverview flex" header={header} provideBackButtonNavigation={showBackButton} showOnTop={true}>
        <WorkspaceOverview />
      </PageLayout>
    );
  }
}
