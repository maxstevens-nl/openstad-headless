import "../index.css";
import "./index.css";
import type React from "react";
import { forwardRef } from "react";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import {
	FormField,
	FormFieldDescription,
	FormLabel,
	Paragraph,
	Textbox,
} from "@utrecht/component-library-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
	errors?: string;
	info?: string;
	label?: string;
};

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
	const inputID = Math.random().toString(36).substring(7);

	return (
		<FormField invalid={!!props.errors} type="search">
			{props.label ? (
				<Paragraph>
					<FormLabel htmlFor={inputID}>{props.label}</FormLabel>
				</Paragraph>
			) : null}
			<Textbox
				ref={ref}
				id={inputID}
				invalid={!!props.errors}
				name="search"
				{...props}
				type={"text"}
			/>

			{props.errors ? (
				<FormFieldDescription
					className="utrecht-form-field__description"
					id={`${inputID}-invalid-description`}
					invalid
				>
					{props.errors}
				</FormFieldDescription>
			) : null}
			{props.info && !props.errors ? (
				<FormFieldDescription
					className="utrecht-form-field__description"
					id={`${inputID}-invalid-description`}
				>
					{props.info}
				</FormFieldDescription>
			) : null}
		</FormField>
	);
});

export { Input };
