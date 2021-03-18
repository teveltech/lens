import "./sidebar.scss";

import React from "react";
import type { TabLayoutRoute } from "./tab-layout";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { workloadsRoute, workloadsURL } from "../+workloads/workloads.route";
import { namespacesRoute, namespacesURL } from "../+namespaces/namespaces.route";
import { nodesRoute, nodesURL } from "../+nodes/nodes.route";
import { usersManagementRoute, usersManagementURL } from "../+user-management/user-management.route";
import { networkRoute, networkURL } from "../+network/network.route";
import { storageRoute, storageURL } from "../+storage/storage.route";
import { clusterRoute, clusterURL } from "../+cluster";
import { Config, configRoute, configURL } from "../+config";
import { eventRoute, eventsURL } from "../+events";
import { Apps, appsRoute, appsURL } from "../+apps";
import { namespaceUrlParam } from "../+namespaces/namespace.store";
import { Workloads } from "../+workloads";
import { UserManagement } from "../+user-management";
import { Storage } from "../+storage";
import { Network } from "../+network";
import { crdStore } from "../+custom-resources/crd.store";
import { CrdList, crdResourcesRoute, crdRoute, crdURL } from "../+custom-resources";
import { CustomResources } from "../+custom-resources/custom-resources";
import { isActiveRoute } from "../../navigation";
import { isAllowedResource } from "../../../common/rbac";
import { Spinner } from "../spinner";
import { SidebarItem } from "./sidebar-item";
import { getByPageTarget, getExtensionPageUrl, getRootClusterPageMenus, getTabLayoutRoutes, RegistrationScope } from "../../../extensions/registries";

interface Props {
  className?: string;
  compact?: boolean; // compact-mode view: show only icons and expand on :hover
  toggle(): void; // compact-mode updater
}

@observer
export class Sidebar extends React.Component<Props> {
  static displayName = "Sidebar";

  async componentDidMount() {
    crdStore.reloadAll();
  }

  renderCustomResources() {
    if (crdStore.isLoading) {
      return <Spinner centerHorizontal/>;
    }

    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const submenus: TabLayoutRoute[] = crds.map(crd => ({
        title: crd.getResourceKind(),
        component: CrdList,
        url: crd.getResourceUrl(),
        routePath: String(crdResourcesRoute.path),
      }));

      return (
        <SidebarItem
          key={group}
          id={`crd-group:${group}`}
          url={crdURL({ query: { groups: group } })}
          subMenus={submenus}
          text={group}
          isActive={false}
        />
      );
    });
  }

  renderRegisteredMenus() {
    return getRootClusterPageMenus().map((menuItem, index) => {
      const registeredPage = getByPageTarget(menuItem.target, new Set([RegistrationScope.CLUSTER]));
      const tabRoutes = getTabLayoutRoutes(menuItem);
      const id = `registered-item-${index}`;
      let pageUrl: string;
      let isActive = false;

      if (registeredPage) {
        const { extensionName, id: pageId } = registeredPage;

        pageUrl = getExtensionPageUrl({ extensionName, pageId, params: menuItem.target.params });
        isActive = isActiveRoute(registeredPage.url);
      } else if (tabRoutes.length > 0) {
        pageUrl = tabRoutes[0].url;
        isActive = isActiveRoute(tabRoutes.map((tab) => tab.routePath));
      } else {
        return;
      }

      return (
        <SidebarItem
          key={id}
          id={id}
          url={pageUrl}
          text={menuItem.title}
          icon={<menuItem.components.Icon/>}
          isActive={isActive}
          subMenus={tabRoutes}
        />
      );
    });
  }

  render() {
    const { toggle, compact, className } = this.props;
    const query = namespaceUrlParam.toObjectParam();

    return (
      <div className={cssNames(Sidebar.displayName, "flex column", { compact }, className)}>
        <div className="header flex align-center">
          <NavLink exact to="/" className="box grow">
            <Icon svg="logo-lens" className="logo-icon"/>
            <div className="logo-text">Lens</div>
          </NavLink>
          <Icon
            focusable={false}
            className="pin-icon"
            tooltip="Compact view"
            material={compact ? "keyboard_arrow_right" : "keyboard_arrow_left"}
            onClick={toggle}
          />
        </div>
        <div className={cssNames("sidebar-nav flex column box grow-fixed", { compact })}>
          <SidebarItem
            id="cluster"
            isActive={isActiveRoute(clusterRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={clusterURL()}
            text="Cluster"
            icon={<Icon svg="kube"/>}
          />
          <SidebarItem
            id="nodes"
            isActive={isActiveRoute(nodesRoute)}
            isHidden={!isAllowedResource("nodes")}
            url={nodesURL()}
            text="Nodes"
            icon={<Icon svg="nodes"/>}
          />
          <SidebarItem
            id="workloads"
            isActive={isActiveRoute(workloadsRoute)}
            isHidden={Workloads.tabRoutes.length == 0}
            url={workloadsURL({ query })}
            subMenus={Workloads.tabRoutes}
            text="Workloads"
            icon={<Icon svg="workloads"/>}
          />
          <SidebarItem
            id="config"
            isActive={isActiveRoute(configRoute)}
            isHidden={Config.tabRoutes.length == 0}
            url={configURL({ query })}
            subMenus={Config.tabRoutes}
            text="Configuration"
            icon={<Icon material="list"/>}
          />
          <SidebarItem
            id="networks"
            isActive={isActiveRoute(networkRoute)}
            isHidden={Network.tabRoutes.length == 0}
            url={networkURL({ query })}
            subMenus={Network.tabRoutes}
            text="Network"
            icon={<Icon material="device_hub"/>}
          />
          <SidebarItem
            id="storage"
            isActive={isActiveRoute(storageRoute)}
            isHidden={Storage.tabRoutes.length == 0}
            url={storageURL({ query })}
            subMenus={Storage.tabRoutes}
            icon={<Icon svg="storage"/>}
            text="Storage"
          />
          <SidebarItem
            id="namespaces"
            isActive={isActiveRoute(namespacesRoute)}
            isHidden={!isAllowedResource("namespaces")}
            url={namespacesURL()}
            icon={<Icon material="layers"/>}
            text="Namespaces"
          />
          <SidebarItem
            id="events"
            isActive={isActiveRoute(eventRoute)}
            isHidden={!isAllowedResource("events")}
            url={eventsURL({ query })}
            icon={<Icon material="access_time"/>}
            text="Events"
          />
          <SidebarItem
            id="apps"
            isActive={isActiveRoute(appsRoute)}
            url={appsURL({ query })}
            subMenus={Apps.tabRoutes}
            icon={<Icon material="apps"/>}
            text="Apps"
          />
          <SidebarItem
            id="users"
            isActive={isActiveRoute(usersManagementRoute)}
            url={usersManagementURL({ query })}
            subMenus={UserManagement.tabRoutes}
            icon={<Icon material="security"/>}
            text="Access Control"
          />
          <SidebarItem
            id="custom-resources"
            isActive={isActiveRoute(crdRoute)}
            isHidden={!isAllowedResource("customresourcedefinitions")}
            url={crdURL()}
            subMenus={CustomResources.tabRoutes}
            icon={<Icon material="extension"/>}
            text="Custom Resources"
          >
            {this.renderCustomResources()}
          </SidebarItem>
          {this.renderRegisteredMenus()}
        </div>
      </div>
    );
  }
}
