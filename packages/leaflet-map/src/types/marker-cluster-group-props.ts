import "leaflet.markercluster";

import type { MarkerCluster } from "leaflet";
import type { CategorizeType } from "./categorize.js";
import type { MarkerProps } from "./marker-props.js";

export type MarkerClusterGroupProps = {
	isActive?: boolean;
	maxClusterRadius?: number;
	showCoverageOnHover?: boolean;
	categorize?: CategorizeType;
	iconCreateFunction?: (cluster: MarkerCluster, categorize: any) => any; // TODO
	markers?: Array<MarkerProps>;
};
