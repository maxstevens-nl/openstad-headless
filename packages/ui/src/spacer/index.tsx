import "./index.css";

export function Spacer({ size = 1 }: { size?: number }) {
	const correctSize: string = Number.isNaN(size)
		? "1"
		: size.toString().startsWith(".")
			? size.toString().replace(".", "0.")
			: size.toString();
	const sizeClass = `spacer-${correctSize.replace(".", "-")}`;

	return <div className={sizeClass} />;
}
