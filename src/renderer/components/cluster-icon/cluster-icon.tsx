import "./cluster-icon.scss";

import React, { DOMAttributes } from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { Params as HashiconParams } from "@emeraldpay/hashicon";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { Cluster } from "../../../main/cluster";
import { cssNames, IClassName } from "../../utils";
import { Badge } from "../badge";
import { Tooltip } from "../tooltip";
import { subscribeToBroadcast } from "../../../common/ipc";
import { computed, observable } from "mobx";
import { workspaceStore } from "../../../common/workspace-store";

interface Props extends DOMAttributes<HTMLElement> {
  cluster: Cluster;
  className?: IClassName;
  errorClass?: IClassName;
  showErrors?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
  options?: HashiconParams;
}

const defaultProps: Partial<Props> = {
  showErrors: true,
  showTooltip: true,
};

@observer
export class ClusterIcon extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  @observable eventCount = 0;

  @computed get eventCountBroadcast() {
    const { cluster } = this.props;

    return `cluster-warning-event-count:${cluster.id}`;
  }

  @computed get isActive() {
    const { cluster } = this.props;

    return workspaceStore.getById(cluster.workspace).activeClusterId === cluster.id;
  }

  componentDidMount() {
    const subscriber = subscribeToBroadcast(this.eventCountBroadcast, (ev, eventCount) => {
      this.eventCount = eventCount;
    });

    disposeOnUnmount(this, [
      subscriber
    ]);
  }

  render() {
    const { isActive } = this;
    const {
      cluster, showErrors, showTooltip, errorClass, options, interactive,
      children, ...elemProps
    } = this.props;
    const { name, preferences, id: clusterId, online } = cluster;
    const eventCount = this.eventCount;
    const { icon } = preferences;
    const clusterIconId = `cluster-icon-${clusterId}`;
    const className = cssNames("ClusterIcon flex inline", this.props.className, {
      interactive: interactive !== undefined ? interactive : !!this.props.onClick,
      active: isActive,
    });

    return (
      <div {...elemProps} className={className} id={showTooltip ? clusterIconId : null}>
        {showTooltip && (
          <Tooltip targetId={clusterIconId}>{name}</Tooltip>
        )}
        {icon && <img src={icon} alt={name}/>}
        {!icon && <Hashicon value={clusterId} options={options}/>}
        {showErrors && eventCount > 0 && !isActive && online && (
          <Badge
            className={cssNames("events-count", errorClass)}
            label={eventCount >= 1000 ? `${Math.ceil(eventCount / 1000)}k+` : eventCount}
          />
        )}
        {children}
      </div>
    );
  }
}
