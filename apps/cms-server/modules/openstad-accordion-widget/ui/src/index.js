export default () => {
	apos.util.widgetPlayers["openstad-accordion"] = {
		selector: "[data-openstad-accordion]",
		player: (el) => {
			ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, {
				...el.dataset,
			});
		},
	};
};
