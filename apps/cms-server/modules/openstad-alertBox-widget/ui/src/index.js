export default () => {
	apos.util.widgetPlayers["openstad-alertBox"] = {
		selector: "[data-openstad-alertbox]",
		player: (el) => {
			ApostropheWidgetsAlertBox.AlertBox.loadWidgetOnElement(el, {
				...el.dataset,
			});
		},
	};
};
