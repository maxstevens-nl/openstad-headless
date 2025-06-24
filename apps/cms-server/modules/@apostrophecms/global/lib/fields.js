const _ = require("lodash");

const rightsChoices = [
	{
		label: "Anonymous",
		value: "anonymous",
	},
	{
		label: "Registered user",
		value: "member",
	},
];

const flagChoices = [
	{
		label: "Groen",
		value: "green",
	},
	{
		label: "Donkergroen",
		value: "dark-green",
	},
	{
		label: "Grijs",
		value: "gray",
	},
	{
		label: "Donkergrijs",
		value: "dark-gray",
	},
	{
		label: "Geel",
		value: "yellow",
	},
	{
		label: "Blauw",
		value: "blue",
	},
	{
		label: "Donkerblauw",
		value: "dark-blue",
	},
	{
		label: "Rood",
		value: "red",
	},
	{
		label: "Paars",
		value: "purple",
	},
];

const resultObject = (inputArray) => {
	return inputArray.reduce((acc, curr) => {
		const { name, ...rest } = curr;
		acc[name] = { ...rest };
		return acc;
	}, {});
};

module.exports = resultObject([
	{
		type: "string",
		name: "projectTitle",
		label: "Project title",
	},
	{
		name: "fbImage",
		type: "attachment",
		svgImages: true,
		label:
			"Default FB image when sharing pages (gets overwritten when sharing ideas)",
		trash: true,
	},
	{
		name: "stylesheets",
		label: "External stylesheets",
		type: "array",
		titleField: "url",
		fields: {
			add: {
				url: {
					type: "string",
					name: "url",
					label: "Url",
				},
			},
		},
	},
	{
		name: "inlineCss",
		label: "CSS",
		type: "string",
		textarea: true,
	},
	{
		name: "favicon",
		type: "attachment",
		svgImages: true,
		label: "Favicon",
		trash: true,
	},
	{
		type: "boolean",
		name: "shouldAutoTranslate",
		label: "Try to translate each page on entering",
		def: false,
		choices: [
			{
				label: "Yes",
				value: true,
			},
			{
				label: "No",
				value: false,
			},
		],
	},
	{
		name: "ideaSlug",
		type: "string",
		permission: "admin",
		label: "Slug van idee pagina",
		help: "Slug van de ideepagina. Let op: dit wordt in het gebruikersaccount gebruikt om gebruikers naar hun plan te verwijzen. Geef de locatie op van het plan, met daarin {ideaId} voor het plan-Id. Bijvoorbeeld: /plan/{ideaId} of /stemmen#ideaId-{ideaId}",
		apiSyncField: "cms.ideaSlug",
		required: false,
	},
	{
		name: "ideaOverviewSlug",
		type: "string",
		permission: "admin",
		label: "Slug van overzichts pagina",
		apiSyncField: "cms.ideaOverviewSlug",
		required: false,
	},
	{
		name: "editIdeaUrl",
		type: "string",
		permission: "admin",
		label: "Url van de bewerk pagina",
		required: false,
	},
	{
		name: "modbreakAuthor",
		type: "string",
		label: "Author of the modbreaks",
		required: false,
	},
	{
		type: "string",
		name: "captchaRefreshText",
		label: "Text for captcha refresh",
	},

	{
		type: "boolean",
		name: "hideProjectTitle",
		label: "Hide the project title in the header?",
		def: true,
	},
	{
		name: "projectLogo",
		type: "attachment",
		svgImages: true,
		label: "Logo",
		apiSyncField: "styling.logo",
		trash: true,
	},
	{
		name: "formattedLogo",
		permission: "admin",
		type: "string",
		label: "Formatted Logo",
		formatField: (value, apos, doc, req) => {
			const projectUrl = apos.settings.getOption(req, "projectUrl");
			return doc.projectLogo
				? projectUrl + apos.attachments.url(doc.projectLogo)
				: "";
		},
		apiSyncField: "styling.logo",
	},
	{
		name: "formattedPaletteCSS",
		permission: "admin",
		type: "string",
		label: "Formatted CSS",
		formatField: (value, apos, doc) => {
			const paletteFields =
				apos.modules["apostrophe-global"].options.paletteFields;
			const rules = [];

			paletteFields.forEach((field) => {
				let selectors = field.selector;
				let properties = field.property;
				const fieldValue = doc[field.name];
				const fieldUnit = field.unit || "";

				if (!fieldValue) {
					return;
				}

				if (_.isString(selectors)) {
					selectors = [selectors];
				}

				if (_.isString(properties)) {
					properties = [properties];
				}

				properties.forEach((property) => {
					selectors.forEach((selector) => {
						let rule = "";
						if (field.mediaQuery) {
							rule += `@media ${field.mediaQuery} { `;
						}
						if (field.valueTemplate) {
							const regex = /%VALUE%/gi;
							rule += `${selector}{ ${property}: ${field.valueTemplate.replace(regex, fieldValue + fieldUnit)}; }`;
						} else {
							rule += `${selector} { ${property}: ${fieldValue}${fieldUnit}; }`;
						}

						if (field.mediaQuery) {
							rule += " } ";
						}
						rules.push(rule);
					});
				});
			});

			return rules.join("");
		},
		apiSyncField: "styling.inlineCSS",
	},

	{
		name: "logoLink",
		type: "string",
		label:
			"Where do we want to link the logo towards? (leave empty for default app url)",
		//    apiSyncField: 'logo'
	},
	{
		name: "mapCenterLat",
		type: "float",
		label: "Map center Latitude",
	},
	{
		name: "mapCenterLng",
		type: "float",
		label: "Map center Longitude",
	},
	{
		name: "mapZoomLevel",
		type: "range",
		label: "Map zoom level",
		min: 12,
		max: 17,
		step: 1, // optional
	},
	{
		name: "mapPolygonsKey",
		type: "select",
		label: "Selecteer een polygon",
		apiSyncField: "area.id",
		choices: "loadPolygonsFromApi",
	},
	{
		name: "displayLoginTopLink",
		type: "boolean",
		label: "Display login and logout link in top links?",
	},
	{
		name: "openstreetmapsServerUrl",
		type: "string",
		label: "Openstreet Maps ServerUrl (not implemented yet)",
	},

	{
		name: "themes",
		type: "array",
		titleField: "label",
		label: "Thema's",
		fields: {
			add: resultObject([
				{
					name: "value",
					label: "Name",
					type: "string",
				},
				{
					name: "flag",
					type: "select",
					label: "Welke vlag moet er getoond worden bij dit thema?",
					choices: flagChoices,
					def: "blue",
				},
				{
					name: "mapUploadedFlag",
					type: "attachment",
					label: "Upload een vlag (liefst png)",
					trash: true,
				},
				{
					name: "mapFlagWidth",
					label: "Map Flag Width",
					type: "string",
				},
				{
					name: "mapFlagHeight",
					label: "Map Flag height",
					type: "string",
				},
				{
					name: "mapicon",
					type: "string",
					label: "Icon op de kaart (JSON, momenteel alleen Kaartapplicatie)",
				},
				{
					name: "listicon",
					type: "string",
					label: "Icon in de lijst (JSON, momenteel alleen Kaartapplicatie)",
				},
				{
					name: "color",
					label:
						"Wat is de kleur van dit thema (momenteel alleen voor Budgeting per thema)",
					type: "string",
				},
				{
					name: "initialAvailableBudget",
					label: "Available Budget (momenteel alleen voor Budgeting per thema)",
					type: "integer",
				},
				{
					name: "minimalBudgetSpent",
					label:
						"Minimum budget that has to be selected (momenteel alleen voor Budgeting per thema)",
					type: "integer",
				},
				{
					name: "maxIdeas",
					type: "integer",
					label:
						"Maximum selectable ideas (momenteel alleen voor Budgeting - count per thema)",
				},
				{
					name: "minIdeas",
					type: "integer",
					label:
						"Minimum selectable ideas (momenteel alleen voor Budgeting - count per thema)",
				},
			]),
		},
	},

	{
		type: "array",
		name: "ideaTypes",
		label: "Typen ideeën",
		apiSyncField: "ideas.types",
		help: "Wordt momenteel alleen gebruikt in 'Ideeen op een kaart' widget",
		fields: {
			add: resultObject([
				{
					name: "name",
					type: "string",
					label: "Naam",
				},
				{
					name: "id",
					type: "string",
					label: "Waarde",
				},
				{
					name: "label",
					type: "string",
					label: "Label op detail pagina",
				},
				{
					name: "textColor",
					type: "string",
					label: "Tekst kleur, onder meer voor labels",
				},
				{
					name: "backgroundColor",
					type: "string",
					label: "Achtergrondkleur, onder meer voor labels",
				},
				{
					name: "mapicon",
					type: "string",
					label: "Icon op de kaart",
				},
				{
					name: "listicon",
					type: "string",
					label: "Icon in ideeën overzicht",
				},
				{
					name: "buttonicon",
					type: "string",
					label: "Icon op buttons",
				},
				{
					name: "buttonLabel",
					type: "string",
					label: "Tekst op buttons",
				},
			]),
		},
	},

	{
		name: "areas",
		type: "array",
		titleField: "label",
		label: "Buurten",
		fields: {
			add: {
				value: {
					label: "Name",
					type: "string",
				},
			},
		},
	},
	{
		name: "arrangeMainMenu",
		type: "checkboxes",
		label: "How to display the main menu?",
		choices: [
			{
				value: "default",
				label: "Display pages automatically",
			},
			{
				value: "manually",
				label: "Arrange menu items manually",
				showFields: ["mainMenuItems"],
			},
			{
				value: "hideMenu",
				label: "Hide the menu items",
				showFields: ["mainMenuItems"],
			},
		],
	},
	{
		name: "mainMenuItems",
		type: "array",
		label: "Menu items",
		titleField: "mainMenuLabel",
		fields: {
			add: resultObject([
				{
					name: "mainMenuLabel",
					type: "string",
					label: "Label",
				},
				{
					name: "mainMenuUrl",
					type: "string",
					label: "Url",
				},
				{
					name: "mainMenuTarget",
					type: "boolean",
					label: "Open in new window",
				},
			]),
		},
	},
	{
		name: "ctaButtonText",
		type: "string",
		label: "CTA button text",
	},
	{
		name: "ctaButtonUrl",
		type: "string",
		label: "CTA button url",
	},
	{
		name: "topLinks",
		type: "array",
		label: "Top Links",
		titleField: "label",
		fields: {
			add: resultObject([
				{
					name: "label",
					type: "string",
					label: "Label",
				},
				{
					name: "url",
					type: "string",
					label: "Url",
				},
				{
					name: "targetBlank",
					type: "boolean",
					label: "Open in new tab",
				},
				{
					name: "displayWhen",
					label: "Display depending on user logged in status?",
					type: "select",
					choices: [
						{
							value: "always",
							label: "Always display",
						},
						{
							value: "loggedIn",
							label: "Display when logged in",
						},
						{
							value: "notLoggedIn",
							label: "Display when not logged in",
						},
					],
				},
			]),
		},
	},
	{
		name: "displayMyAcount",
		type: "boolean",
		label: "Display my account in main menu?",
	},
	{
		name: "myAccountButtonText",
		type: "string",
		label: "My account button text",
	},
	{
		name: "cacheIdeas",
		permission: "admin",
		type: "boolean",
		label:
			"Cache ideas? This optimises performance for projects, only works for projects where ideas are static, most voting sits",
	},
	{
		name: "newsletterModalTitle",
		type: "string",
		label: "Title for the popup",
		textarea: true,
		//    def: 'Sign up for the newsletter'
	},
	{
		name: "newsletterModalDescription",
		type: "string",
		label: "Description for the popup",
		textarea: true,
		//  def: 'Sign up for the newsletter to stay up to date when news about this project.'
	},
	{
		name: "newsletterModalSubmit",
		type: "string",
		label: "Submit button",
		textarea: true,
		def: "Submit",
	},
	{
		type: "boolean",
		name: "useCaptchaForNewsletter",
		label: "Use a captcha as protection?",
		help: "The captcha prevents bots from (repeatedly) subscribing to the newsletter, but makes it harder for legitimate users to submit the form.",
		def: true,
		choices: [
			{
				label: "Yes",
				value: true,
				showFields: ["captchaLabel", "captchaRefreshText"],
			},
			{
				label: "No",
				value: false,
			},
		],
	},
	{
		name: "captchaLabel",
		type: "string",
		label: "Captcha Label",
	},
	{
		name: "newsletterModalCancel",
		type: "string",
		label: "Cancel button",
		textarea: true,
		def: "Cancel",
	},
	// ----------------------------------------------------------------------------------------------------
	// form
	// TODO: dit is al de zoveelste kopie en moet dus naar een lib
	{
		name: "newsletterModalFormFields",
		label: "Newsletter form fields",
		help: "The form default shows a Name and an Email field; if you would like something different you can define that here",
		type: "array",
		titleField: "title",
		fields: {
			add: resultObject([
				{
					type: "string",
					name: "name",
					label: "Fieldname",
					help: "Name of this field in the API: email, firstName, lastName, displayName or extraData.xxx",
				},
				{
					type: "string",
					name: "title",
					label: "Title",
				},
				{
					type: "string",
					name: "placeholder",
					label: "Placeholder tekst",
					help: "Text that is placed in an empty field",
				},
				{
					name: "inputType",
					label: "Type veld",
					type: "select",
					choices: [
						{
							label: "Text",
							value: "text",
						},
						{
							label: "Checkbox",
							value: "checkbox",
						},
					],
				},
				{
					type: "select",
					name: "required",
					label: "Required",
					def: "none",
					choices: [
						{
							label: "Yes",
							value: true,
						},
						{
							label: "No",
							value: false,
						},
					],
				},
			]),
		},
	},
	// einde form
	// ----------------------------------------------------------------------------------------------------
	{
		name: "footer",
		type: "array",
		titleField: "title",
		fields: {
			add: resultObject([
				{
					name: "title",
					label: "Titel",
					type: "string",
				},
				{
					name: "description",
					label: "Description",
					type: "string",
					textarea: true,
				},
				{
					name: "links",
					type: "array",
					label: "Links",
					titleField: "label",
					fields: {
						add: resultObject([
							{
								name: "label",
								type: "string",
								label: "Label",
							},
							{
								name: "url",
								type: "string",
								label: "Url",
							},
							{
								name: "targetBlank",
								type: "boolean",
								label: "Open in new window",
							},
						]),
					},
				},
			]),
		},
	},
	{
		name: "roleToLike",
		permission: "admin",
		type: "select",
		label: "What role is necessary to like an idea?",
		choices: rightsChoices,
		def: "member",
	},
	{
		type: "boolean",
		name: "applyPaletteStyling",
		label: "Apply palette styling",
		def: true,
	},
]);
