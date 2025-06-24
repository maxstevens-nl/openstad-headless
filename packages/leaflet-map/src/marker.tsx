import type { LeafletMouseEvent } from "leaflet";
import { Marker as LeafletMarker } from "react-leaflet";
import { useMap } from "react-leaflet/hooks";
import { addToClassname, removeFromClassName } from "../../lib/class-name.js";
import MarkerIcon from "./marker-icon.js";
import type { MarkerProps } from "./types/marker-props.js";

export default function Marker({
	lat = undefined,
	lng = undefined,
	isFaded = false,
	isVisible = true,
	icon = undefined,
	iconCreateFunction = undefined,
	defaultIcon = undefined,
	href = undefined,
	onClick = undefined,
	onMouseDown = undefined,
	onMouseUp = undefined,
	onDragStart = undefined,
	onDragEnd = undefined,
	...props
}: MarkerProps) {
	const map = useMap();

	// icon
	if (icon) {
		try {
			icon = JSON.parse(icon as string);
		} catch (err) {}
		addToClassname(icon, "osc-map-marker", { before: true });
		isFaded
			? addToClassname(icon, "osc-map-marker-faded")
			: removeFromClassName(icon, "osc-map-marker-faded");
	}
	icon = MarkerIcon({ icon, iconCreateFunction, defaultIcon });

	const eventHandlers: {
		[eventname: string]: (e: LeafletMouseEvent) => void;
	} = {};

	for (let eventname of [
		"click",
		"mouseDown",
		"mouseUp",
		"dragStart",
		"dragEnd",
	]) {
		const EventName = `on${eventname.charAt(0).toUpperCase()}${eventname.slice(1)}`;
		eventname = eventname.toLowerCase();
		let onEvent = (props as any)[EventName] || [];
		if (!Array.isArray(onEvent)) onEvent = [onEvent];

		if (EventName === "onClick" && href) {
			onEvent.push(() => {
				document.location.href = href;
			});
		}

		if (onEvent.length) {
			eventHandlers[eventname] = (e: LeafletMouseEvent) => {
				onEvent.forEach(
					(func: ((e: LeafletMouseEvent, map: any) => void) | string) => {
						const customEvent = new CustomEvent("osc-map-marker-click", {
							detail: e,
						});
						window.dispatchEvent(customEvent);

						if (typeof func === "string") {
							const resolvedFunction = (globalThis as Record<string, any>)[
								func
							];

							if (typeof resolvedFunction === "function") {
								resolvedFunction(e, map);
							} else {
								console.warn(
									`Function "${func}" is not defined on globalThis.`,
								);
							}
						} else {
							func(e, map);
						}
					},
				);
			};
		}
	}

	const draggable = eventHandlers.dragstart || eventHandlers.dragend;

	return isVisible && typeof lat === "number" && typeof lng === "number" ? (
		<LeafletMarker
			{...props}
			draggable={!!draggable}
			eventHandlers={eventHandlers}
			icon={icon}
			position={[lat, lng]}
		/>
	) : null;
}
