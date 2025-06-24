import React from "react";
import "../index.css";
import "./index.css";
import { Icon } from "../icon";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button } from "@utrecht/component-library-react";

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	icon?: string;
	text?: string;
	iconOnly?: boolean;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	(props, ref) => {
		return (
			<Button
				appearance={props.className}
				ref={ref}
				{...props}
				className={"osc-icon-button"}
			>
				{props.icon ? (
					<Icon icon={props.icon} text={props.text} iconOnly={props.iconOnly} />
				) : null}
				{props.children}
			</Button>
		);
	},
);
