export default () => {
	apos.util.widgetPlayers["openstad-button"] = {
		selector: "[data-openstad-button]",
		player: (el) => {
			ApostropheWidgetsButton.Button.loadWidgetOnElement(el, { ...el.dataset });
		},
	};
};
