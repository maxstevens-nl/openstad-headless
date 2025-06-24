$(() => {
	initFormsValidation();
	initHideFlash();
	initRemoveErrorLabelOnType();
});

$.validator.addMethod(
	"postcodeNL",
	(value, element, val) => {
		const rege = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
		return rege.test(value);
	},
	"Postcode niet correct",
);

function initFormsValidation() {
	$(".validate-form").each(function () {
		$(this).validate({
			rules: {
				name: {
					minlength: 1,
					normalizer: function (value) {
						// Update the value of the element
						this.value = $.trim(value);
						// Use the trimmed value for validation
						return this.value;
					},
				},
				password: {
					minlength: 6,
				},
				password_confirm: {
					minlength: 6,
					equalTo: "#password",
				},
				postcode: {
					postcodeNL: true,
				},
			},
			submitHandler: (form) => {
				const $submitButtons = $(form).find(
					'input[type="submit"], button[type="submit"]',
				);
				$submitButtons.attr("disabled", true);
				form.submit();
			},
		});
	});
}

function initRemoveErrorLabelOnType() {
	$(".side-error input").on("keydown", function () {
		const $sideError = $(this).closest(".side-error");
		$sideError.find(".error-label").remove();
		$sideError.removeClass("side-error");
	});
}

function initHideFlash() {
	$(".flash-container .close-button").click(function () {
		$(this).closest(".flash-container").remove();
	});

	setTimeout(() => {
		//  $('.flash-container').remove();
	}, 5000);
}
