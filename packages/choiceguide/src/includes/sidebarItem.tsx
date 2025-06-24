import type React from "react";
import { useEffect, useState } from "react";
import { calculateColor, calculateScoreForItem } from "../parts/scoreUtils";
import type { ChoiceOptions, Score } from "../props";

const defaultBarColor = {
	default: "#bed200",
	min: "#ff9100",
	max: "#bed200",
};

type ChoiceItemProps = {
	choiceOption: ChoiceOptions;
	answers: Record<string, string>;
	weights: Record<string, Record<string, Record<string, any>>>;
	choicesType: "default" | "minus-to-plus-100" | "plane" | "hidden";
	choicesPreferenceMinColor?: string;
	choicesPreferenceMaxColor?: string;
	showPageCountAndCurrentPageInButton?: boolean;
};

const ChoiceItem: React.FC<ChoiceItemProps> = (props) => {
	const [score, setScore] = useState<Score>({ x: 0, y: 0, z: 0 });

	// Calculate score for this item
	useEffect(() => {
		const itemScore = calculateScoreForItem(
			props.choiceOption,
			props.answers,
			props.weights,
			props.choicesType,
		);
		setScore(itemScore);
	}, [props.choiceOption, props.answers, props.weights]);

	const renderScore = () => {
		if (props.choicesType === "minus-to-plus-100") {
			const percentage =
				Number.parseFloat((2 * (score.x - 50)).toString()) || 0;
			const backgroundColor = calculateColor(
				score.x,
				props.choicesPreferenceMinColor,
				props.choicesPreferenceMaxColor,
			);

			document.documentElement.style.setProperty(
				"--choiceguide-minus-to-plus-width",
				`${percentage >= 0 ? percentage / 2 : -percentage / 2}%`,
			);
			document.documentElement.style.setProperty(
				"--choiceguide-minus-to-plus-bg",
				backgroundColor,
			);

			const getClass = (perc: number) => {
				if (perc < 0) {
					return "osc-choice-bar-progress-negative";
				}
				return "osc-choice-bar-progress-positive";
			};

			const percentageValue =
				percentage >= 0 ? percentage / 2 : -percentage / 2;

			return (
				<div
					className="osc-choice-default minus-to-plus"
					data-score={Math.round(percentageValue)}
				>
					<h4>{props.choiceOption?.title}</h4>
					<div className="osc-choice-bar osc-from-center">
						<div
							className={`osc-choice-bar-progress ${getClass(percentage)}`}
						/>
					</div>
				</div>
			);
		}
		const percentageValue = Number.parseFloat(score.x.toString()) || 0;

		document.documentElement.style.setProperty(
			"--choiceguide-not-minus-to-plus-bg",
			defaultBarColor.default,
		);

		return (
			<div className="osc-choice-default not-minus-to-plus">
				<h4>{props.choiceOption?.title}</h4>
				<div className="osc-choice-bar">
					<div className="osc-choice-bar-mask" />
					<div
						className="osc-choice-bar-progress"
						data-score={Math.round(percentageValue)}
					/>
				</div>
			</div>
		);
	};

	return renderScore();
};

export default ChoiceItem;
