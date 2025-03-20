import type { AreaProps } from "./area-props.js";
import type { BaseMapProps } from "./basemap-props.js";
import type { DatalayerProps } from "./datalayer-props.js";
import type { MapTilesProps } from "./map-tiles-props.js";
import type { MarkerClusterGroupProps } from "./marker-cluster-group-props.js";
import type { MarkerProps } from "./marker-props.js";

export type MapPropsType = BaseMapProps &
	MapTilesProps &
	MarkerProps &
	MarkerClusterGroupProps &
	AreaProps &
	DatalayerProps;
