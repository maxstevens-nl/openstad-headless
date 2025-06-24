import type { MarkerCluster } from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import LeafletMarkerClusterGroup from "react-leaflet-cluster";
import type { MarkerClusterGroupProps } from "./types/marker-cluster-group-props.js";

import amapsCreateClusterIcon from "./lib/amaps-cluster-icon.js";
import Marker from "./marker.jsx";

export default function MarkerClusterGroup({
	maxClusterRadius = 40,
	showCoverageOnHover = false,
	iconCreateFunction = amapsCreateClusterIcon,
	categorize = undefined,
	markers = [],
	...props
}: MarkerClusterGroupProps) {
	const categorizeRef = useRef(categorize);
	useEffect(() => {
		categorizeRef.current = categorize;
	});

	const useIconCreateFunction = useCallback(
		(cluster: MarkerCluster) => {
			if (iconCreateFunction && typeof iconCreateFunction === "string") {
				const globalFunction = globalThis[iconCreateFunction];
				if (typeof globalFunction === "function") {
					iconCreateFunction = globalFunction;
				} else {
					console.warn(
						`Function ${iconCreateFunction} does not exist in the global scope.`,
					);
					return null;
				}
			}

			if (typeof iconCreateFunction !== "function") {
				console.warn("iconCreateFunction is not a valid function.");
				return null;
			}

			return iconCreateFunction(cluster, categorizeRef.current);
		},
		[markers],
	);

	return (
		<LeafletMarkerClusterGroup
			{...props}
			iconCreateFunction={useIconCreateFunction}
			maxClusterRadius={maxClusterRadius}
			showCoverageOnHover={showCoverageOnHover}
		>
			{markers?.map((data) => {
				return <Marker {...data} key={`marker-${data.markerId}`} />;
			})}
		</LeafletMarkerClusterGroup>
	);
}
