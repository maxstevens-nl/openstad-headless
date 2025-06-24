const polygons = require("../../../../config/map").default.polygons;
const eventEmitter = require("../../../../events").emitter;

const crypto = require("node:crypto");
const deepl = require("deepl-node");

const translatorConfig = { maxRetries: 5, minTimeout: 10000 };

module.exports = (self, options) => {
	self.translate = async (req, res) => {
		const deeplAuthKey = options.deeplKey;
		const content = req.body.contents;
		const origin = req.body.origin;
		const sourceLanguageCode = req.body.sourceLanguageCode;
		const destinationLanguage = req.body.targetLanguageCode;

		if (destinationLanguage === "nl") {
			console.log(
				`Target language is dutch, not translating and responding with the dutch sentences received for project ${origin}`,
			);
			return res.json(content);
		}

		if (!deeplAuthKey) {
			console.log("ERROR: DeepL not configured");
			return res
				.status(500)
				.json({ error: "Could not translate the page at this time" });
		}

		// setup cache store
		const collection = self.apos.db.collection("deepl-translations");

		// setup translate service
		let translator = null;
		try {
			translator = new deepl.Translator(deeplAuthKey, translatorConfig);
		} catch (error) {
			console.log({ error });
		}
		if (!translator)
			return res
				.status(500)
				.json({ error: "Could not translate the page at this time" });

		// find translations and collect missing translations
		let result = {};
		const untranslatable = [];
		const untranslatedElements = [];
		for (const text of content) {
			if (text.match(/[^\d\W]/)) {
				const cacheKey = crypto
					.createHash("sha256")
					.update(`${destinationLanguage}${text}`)
					.digest("hex");
				const translated = await collection.findOne({ _id: cacheKey });
				if (translated) {
					result[text] = translated.translations;
				} else {
					untranslatedElements.push(text);
				}
			} else {
				// nothing to translate
				result[text] = { text };
				untranslatable.push(text);
			}
		}

		// now translate missing translations
		if (untranslatedElements.length) {
			const characterCount = untranslatedElements
				.map((word) => word.length)
				.reduce((total, a) => total + a, 0);
			console.log(
				`Fetch missing translations from DeepL for project: ${origin} with charactersize of ${characterCount} and destination language ${destinationLanguage}`,
			);

			try {
				const translations = await translator.translateText(
					untranslatedElements,
					sourceLanguageCode,
					destinationLanguage,
				);

				for (let i = 0; i < untranslatedElements.length; i++) {
					const text = untranslatedElements[i];
					const cacheKey = crypto
						.createHash("sha256")
						.update(`${destinationLanguage}${text}`)
						.digest("hex");
					const translatedText = translations[i];
					result[text] = translatedText;
					collection.findOneAndUpdate(
						{ _id: cacheKey },
						{
							$set: {
								origin: origin,
								destinationLanguage: destinationLanguage,
								translations: translatedText,
							},
						},
						{ upsert: true }, // dit zal toch (bijna?) altijd een insert zijn, lijkt me...
					);
				}
			} catch (error) {
				console.log(error);
				return res
					.status(500)
					.json({ error: "Could not translate the page at this time" });
			}
		}

		// transform the result object back to the original array
		result = content.map((text) => result[text]);

		// temp: we need monitoring
		console.log("Aantal elementen:", content.length);
		console.log("Aantal niet te vertalen elementen:", untranslatable.length);
		console.log(
			"Aantal opnieuw vertaalde elementen:",
			untranslatedElements.length,
		);

		return res.json(result);
	};

	self.apos.app.post("/modules/openstad-global/translate", (req, res) => {
		self.translate(req, res);
	});

	self.setSyncFields = () => {
		self.apiSyncFields = self.apos.openstadApi.getApiSyncFields(
			options.addFields,
		);
	};

	// Overriding requirePieceEditorView to sync global field values with api.
	self.requirePieceEditorView = (req, res, next) => {
		const id = self.apos.launder.id(req.body._id);

		if (!self.apos.permissions.can(req, `edit-${self.name}`)) {
			return self.apiResponse(res, "forbidden");
		}

		return self.findForEditing(req, { _id: id }).toObject((err, _piece) => {
			if (err) {
				return self.apiResponse(res, err);
			}
			if (!_piece) {
				return self.apiResponse(res, "notfound");
			}

			// Todo: deserialize formatting fields to get values from the api?

			req.piece = self.apos.openstadApi.syncApiFields(
				_piece,
				self.apiSyncFields,
				req.data.global.projectConfig,
				req.data.global.workflowLocale,
			);

			return next();
		});
	};

	self.formatGlobalFields = (req, doc, options) => {
		//    console.log('req', req)
		// for some reason apos calls this with empty req object on start, this will cause formatting issues so skip in that case
		if (!req.headers) {
			return;
		}

		self.schema.forEach((field, i) => {
			if (field.formatField) {
				//doc is the doc for saving in mongodb, in this case it's the global values
				doc[field.name] = field.formatField(field, self.apos, doc, req);
			}
		});
	};

	self.syncApi = async (req, doc, options) => {
		// Avoid syncing api when it's a default-draft save from workflow
		if (
			doc.type !== "apostrophe-global" ||
			(doc.workflowLocale && doc.workflowLocale === "default-draft")
		) {
			return;
		}

		if (req.data.global) {
			try {
				await self.apos.openstadApi.updateProjectConfig(
					req,
					req.data.global.projectConfig,
					doc,
					self.apiSyncFields,
				);
			} catch (err) {
				console.error(err);
			}
		}
	};

	self.clearCache = (req, doc, options) => {
		eventEmitter.emit("clearCache");
	};

	self.overrideGlobalDataWithProjectConfig = (req, res, next) => {
		const projectConfig = self.apos.settings.getOption(req, "projectConfig");

		// Take default project ID, possible to overwritten
		if (!req.data.global.projectId) {
			req.data.global.projectId = projectConfig.id;
		}

		// empty
		//  req.data.global.projectTitle = '';

		req.data.global.projectConfigTitle = projectConfig.title;

		//  req.data.global.projectConfig = projectConfig;
		req.data.originalUrl = req.originalUrl;

		//add query tot data object, so it can be used
		req.data.query = req.query;

		//
		if (projectConfig?.area?.polygon) {
			req.data.global.mapPolygons = projectConfig?.area?.polygon || "";
		}

		// Todo: remove this fallback when every project use the areaId from the api.
		// This is the fallback for old projects, polygons were hardcoded in the project
		if (req.data.global.mapPolygons === "" && req.data.global.mapPolygonsKey) {
			req.data.global.mapPolygons = polygons[req.data.global.mapPolygonsKey];
		}

		next();
	};

	self.loadPolygonsFromApi = async (addPolygonData) => {
		try {
			const areas = await self.apos.openstadApi.getAllPolygons();

			if (areas) {
				return [{ label: "Geen", value: "" }].concat(
					areas.map((area) => {
						const data = {
							label: area.name,
							value: area.id,
						};

						if (addPolygonData) {
							data.polygon = area.polygon;
						}

						return data;
					}),
				);
			}
			throw new Error("No polygons found");
		} catch (error) {
			// @todo: proper error handling
			return [];
		}
	};
};
