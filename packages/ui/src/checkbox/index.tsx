import type React from "react";
import "../index.css";
import "./index.css";
import { Icon } from "../icon";

type Props = {
	checked?: boolean;
	iconVariant?: "small";
} & React.HTMLAttributes<HTMLDivElement>;

export function Checkbox({ checked, iconVariant, ...props }: Props) {
	return (
		<div
			{...props}
			className={`${props.className} checkbox ${checked ? "checked" : ""}`}
		>
			{checked ? <Icon variant={iconVariant} icon="ri-check-line" /> : null}
		</div>
	);
}
