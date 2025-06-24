import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { loadWidget } from "@openstad-headless/lib/load-widget";
import { useState } from "react";
import "./resourceOverviewWithMap.css";
import {
	ResourceOverview,
	type ResourceOverviewWidgetProps,
} from "../../resource-overview/src/resource-overview.js";

import { ResourceOverviewMap } from "@openstad-headless/leaflet-map/src/resource-overview-map.js";
import type { ResourceOverviewMapWidgetProps } from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";

export type ResourceOverviewWithMapWidgetProps = ResourceOverviewWidgetProps &
	ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapWidgetProps) => {
	const [filteredResources, setFilteredResources] = useState<any[]>([]);

	return (
		<div className="map-wrapper">
			<div className="resourceOverviewWithMap-container">
				<div className="detail-container">
					<ResourceOverview
						{...props}
						onFilteredResourcesChange={setFilteredResources} // Pass the callback function
					/>
				</div>
				<ResourceOverviewMap
					{...props}
					{...props.resourceOverviewMapWidget}
					givenResources={
						filteredResources.length > 0 ? filteredResources : undefined
					}
				/>
			</div>
		</div>
	);
};

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
