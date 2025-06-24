jQuery.extend(jQuery.validator.messages, {
	required: "Dit is een verplicht veld.",
	remote: "Controleer dit veld.",
	email:
		"Controleer of het e-mailadres het volgende formaat heeft: naam@domein.nl.",
	url: "Er is een ongeldige url ingevuld.",
	date: "Er is een ongeldige datum ingevuld.",
	dateISO: "Vul hier een geldige datum in (ISO-formaat).",
	number: "Vul hier een geldig getal in.",
	digits: "Vul hier alleen getallen in.",
	creditcard: "Er is een ongeldig creditcardnummer ingevuld.",
	equalTo: "De waarde komen niet overeen.",
	extension: "Vul hier een waarde in met een geldige extensie.",
	maxlength: jQuery.validator.format("Vul hier maximaal {0} tekens in."),
	minlength: jQuery.validator.format("Vul hier minimaal {0} tekens in."),
	rangelength: jQuery.validator.format(
		"Vul hier een waarde in van minimaal {0} en maximaal {1} tekens.",
	),
	range: jQuery.validator.format(
		"Vul hier een waarde in van minimaal {0} en maximaal {1}.",
	),
	max: jQuery.validator.format(
		"Vul hier een waarde in kleiner dan of gelijk aan {0}.",
	),
	min: jQuery.validator.format(
		"Vul hier een waarde in groter dan of gelijk aan {0}.",
	),

	// for validations in additional-methods.js
	iban: "Er is een ongeldig IBAN ingevuld.",
	dateNL: "Er is een ongeldige datum ingevuld.",
	phoneNL: "Er is een ongeldig Nederlands telefoonnummer ingevuld.",
	mobileNL: "Er is een ongeldig Nederlands mobiel nummer ingevuld.",
	postalcodeNL: "Er is een ongeldige postcode ingevuld.",
	bankaccountNL: "Er is een ongeldig bankrekeningnummer ingevuld.",
	giroaccountNL: "Er is een ongeldig gironummer ingevuld.",
	bankorgiroaccountNL: "Er is een ongeldig bank- of gironummer ingevuld.",
});
