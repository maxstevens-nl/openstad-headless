export default () => {
	apos.util.widgetPlayers["openstad-rte"] = {
		selector: "[data-openstad-rte]",
		player: (el) => {
			ApostropheWidgetsRTE.RTE.loadWidgetOnElement(el, { ...el.dataset });
		},
	};
};
