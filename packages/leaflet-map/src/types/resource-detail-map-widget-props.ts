import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";
import type { MapPropsType } from "./index.js";
import type { MarkerIconType } from "./marker-icon.js";
import type { MarkerProps } from "./marker-props.js";

export type ResourceDetailMapWidgetProps = BaseProps &
	ProjectSettingProps &
	MapPropsType & {
		resourceId?: string | null;
		marker?: MarkerProps;
		markerIcon?: MarkerIconType;
		resourceIdRelativePath?: string;
		pageTitle?: boolean;
	};
