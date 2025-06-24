import { createRoot } from "react-dom/client";
import RenderContent from "../../../ui/src/rte-formatting/rte-formatting";

interface Item {
	content: any;
}

function RTE({ content }: Item) {
	return (
		<div
			className="rte"
			dangerouslySetInnerHTML={{ __html: RenderContent(content) }}
		/>
	);
}

RTE.loadWidgetOnElement = function (
	this: any,
	container: HTMLElement,
	props: any,
) {
	const Component = this;

	if (container) {
		const root = createRoot(container);
		root.render(<Component {...props} />);
	}
};

export { RTE };
