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

@observer
export class LandingPage extends React.Component {
  private static storage = createStorage<WorkspaceId[]>("landing_page", []);

  @computed get workspace() {
    return workspaceStore.currentWorkspace;
  }

  @computed get workspaceClusters() {
    return clusterStore.getByWorkspaceId(this.workspace.id);
  }

  componentDidMount() {
    // ignore workspaces that don't exist
    const seenWorkspaces = new Set(
      LandingPage
        .storage
        .get()
        .filter(id => workspaceStore.getById(id))
    );

    if (!seenWorkspaces.has(this.workspace.id) && this.workspaceClusters.length === 0 && !this.workspace.isManaged) {
      Notifications.info(<><b>Welcome!</b><p>Get started by associating one or more clusters to Lens</p></>, {
        timeout: 30_000,
        id: "landing-welcome"
      });
    }

    seenWorkspaces.add(this.workspace.id);
    LandingPage.storage.set(Array.from(seenWorkspaces));
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
