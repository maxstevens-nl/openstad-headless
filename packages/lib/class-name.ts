export function addToClassname(obj: any, className: any, options?: any) {
	if (obj) {
		if (!obj.className) obj.className = "";
		if (!obj.className.match(new RegExp(` ?${className}(?: |$)`))) {
			obj.className = options?.before
				? `${className} ${obj.className}`
				: `${obj.className} ${className}`;
		}
	}
	return obj;
}

export function removeFromClassName(obj: any, className: any) {
	if (obj?.className) {
		obj.className = obj.className.replace(
			new RegExp(` ?${className}(?: |$)`),
			"",
		);
	}
	return obj;
}
