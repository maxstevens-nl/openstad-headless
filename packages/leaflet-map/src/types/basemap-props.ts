import type { LeafletMouseEvent } from "leaflet";
import type { CategorizeType } from "./categorize.js";
import type { LocationType } from "./location.js";
import type { MarkerClusterGroupProps } from "./marker-cluster-group-props.js";
import type { MarkerIconType } from "./marker-icon.js";
import type { MarkerProps } from "./marker-props.js";

export type BaseMapProps = {
	width?: string;
	height?: string;
	markers?: Array<MarkerProps>;
	zoom?: number;
	autoZoomAndCenter?: "area" | "markers";
	scrollWheelZoom?: boolean;
	center?: LocationType;
	defaultIcon?: MarkerIconType;
	iconCreateFunction?: () => string;
	onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: any) => void;
	onMarkerClick?: (e: LeafletMouseEvent, map: any) => void;
	zoomposition?: string;
	disableDefaultUI?: boolean;
	clustering?: MarkerClusterGroupProps;
	categorize?: CategorizeType;
	minZoom?: number;
	maxZoom?: number;
};
