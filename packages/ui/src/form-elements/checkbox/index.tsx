import { Spacer } from "@openstad-headless/ui/src";
import {
	AccordionProvider,
	Checkbox,
	Fieldset,
	FieldsetLegend,
	FormField,
	FormFieldDescription,
	FormLabel,
	Paragraph,
} from "@utrecht/component-library-react";
import React, { type FC, useEffect, useState } from "react";
import TextInput from "../text";

export type CheckboxFieldProps = {
	title: string;
	description?: string;
	choices?: {
		value: string;
		label: string;
		isOtherOption?: boolean;
		defaultValue?: boolean;
	}[];
	fieldRequired?: boolean;
	requiredWarning?: string;
	fieldKey: string;
	disabled?: boolean;
	type?: string;
	onChange?: (e: {
		name: string;
		value: string | Record<number, never> | [];
	}) => void;
	showMoreInfo?: boolean;
	moreInfoButton?: string;
	moreInfoContent?: string;
	infoImage?: string;
};

const CheckboxField: FC<CheckboxFieldProps> = ({
	title,
	description,
	choices,
	fieldRequired = false,
	fieldKey,
	onChange,
	disabled = false,
	showMoreInfo = false,
	moreInfoButton = "Meer informatie",
	moreInfoContent = "",
	infoImage = "",
}) => {
	const defaultSelectedChoices =
		choices
			?.filter((choice) => choice.defaultValue)
			.map((choice) => choice.value) || [];
	const [selectedChoices, setSelectedChoices] = useState<string[]>(
		defaultSelectedChoices,
	);
	const [otherOptionValues, setOtherOptionValues] = useState<{
		[key: string]: string;
	}>({});

	useEffect(() => {
		const initialOtherOptionValues: { [key: string]: string } = {};
		choices?.forEach((choice, index) => {
			if (choice.isOtherOption) {
				initialOtherOptionValues[`${fieldKey}_${index}_other`] = "";
			}
		});
		setOtherOptionValues(initialOtherOptionValues);
	}, [choices, fieldKey]);

	useEffect(() => {
		if (onChange) {
			onChange({
				name: fieldKey,
				value: JSON.stringify(selectedChoices),
			});
		}
	}, [selectedChoices]);

	class HtmlContent extends React.Component<{ html: any }> {
		render() {
			const { html } = this.props;
			return <div dangerouslySetInnerHTML={{ __html: html }} />;
		}
	}

	const handleChoiceChange = (
		event: React.ChangeEvent<HTMLInputElement>,
		index: number,
	): void => {
		const choiceValue = event.target.value;
		if (event.target.checked) {
			setSelectedChoices([...selectedChoices, choiceValue]);
		} else {
			setSelectedChoices(
				selectedChoices.filter((choice) => choice !== choiceValue),
			);
			if (otherOptionValues.hasOwnProperty(`${fieldKey}_${index}_other`)) {
				otherOptionValues[`${fieldKey}_${index}_other`] = "";
				setOtherOptionValues({ ...otherOptionValues });
				if (onChange) {
					onChange({
						name: `${fieldKey}_${index}_other`,
						value: "",
					});
				}
			}
		}
	};

	const handleOtherOptionChange = (e: { name: string; value: string }) => {
		setOtherOptionValues({
			...otherOptionValues,
			[e.name]: e.value,
		});
		if (onChange) {
			onChange({
				name: e.name,
				value: e.value,
			});
		}
	};

	if (choices) {
		choices = choices.map((choice) => {
			if (typeof choice === "string") {
				return { value: choice, label: choice };
			}
			return choice;
		}) as [
			{
				value: string;
				label: string;
				isOtherOption?: boolean;
				defaultValue?: boolean;
			},
		];
	}

	return (
		<div className="question">
			<Fieldset role="group">
				<FieldsetLegend>{title}</FieldsetLegend>

				{description && (
					<>
						<FormFieldDescription
							dangerouslySetInnerHTML={{ __html: description }}
						/>
						<Spacer size={0.5} />
					</>
				)}

				{showMoreInfo && (
					<>
						<AccordionProvider
							sections={[
								{
									headingLevel: 3,
									body: <HtmlContent html={moreInfoContent} />,
									expanded: undefined,
									label: moreInfoButton,
								},
							]}
						/>
						<Spacer size={1.5} />
					</>
				)}

				{infoImage && (
					<figure className="info-image-container">
						<img src={infoImage} alt="" />
						<Spacer size={0.5} />
					</figure>
				)}

				{choices?.map((choice, index) => (
					<>
						<FormField type="checkbox" key={index}>
							<Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
								<FormLabel
									htmlFor={`${fieldKey}_${index}`}
									type="checkbox"
									className="--label-grid"
								>
									<Checkbox
										className="utrecht-form-field__input"
										id={`${fieldKey}_${index}`}
										name={fieldKey}
										value={choice?.value}
										required={fieldRequired}
										checked={
											choice?.value
												? selectedChoices.includes(choice.value)
												: false
										}
										onChange={(e) => handleChoiceChange(e, index)}
										disabled={disabled}
									/>
									<span>{choice?.label}</span>
								</FormLabel>
							</Paragraph>
						</FormField>
						{choice.isOtherOption && selectedChoices.includes(choice.value) && (
							<div className="marginTop10 marginBottom15">
								<TextInput
									type="text"
									// @ts-ignore
									onChange={(e: { name: string; value: string }) =>
										handleOtherOptionChange(e)
									}
									fieldKey={`${fieldKey}_${index}_other`}
									title=""
									defaultValue={otherOptionValues[`${fieldKey}_${index}_other`]}
								/>
							</div>
						)}
					</>
				))}
			</Fieldset>
		</div>
	);
};

export default CheckboxField;
