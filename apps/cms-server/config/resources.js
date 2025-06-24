const resources = [
	{
		label: "Idea",
		value: "idea",
		resourceEndPoint: "idea",
		//config is used in API config
		configKey: "ideas",
	},
	{
		label: "Site",
		value: "site",
		resourceEndPoint: "site",
		//config is used in API config
		configKey: "sites",
	},
	{
		label: "Article",
		value: "article",
		resourceEndPoint: "article",
		//config is used in API config
		configKey: "articles",
	},
	// always get the values from the active user
	{
		label: "Active User",
		value: "activeUser",
		resourceEndPoint: "user",
		//config is used in API config
		configKey: "users",
	},
	// get user from the API
	{
		label: "Resource User",
		value: "user",
		resourceEndPoint: "user",
		//config is used in API config
		configKey: "users",
	},
	{
		label: "Products",
		value: "product",
		resourceEndPoint: "product",
		//config is used in API config
		configKey: "products",
	},
	{
		label: "Orders",
		value: "order",
		resourceEndPoint: "order",
		//config is used in API config
		configKey: "orders",
	},
	{
		label: "Accounts",
		value: "account",
		resourceEndPoint: "account",
		//config is used in API config
		configKey: "accounts",
	},
	{
		label: "Games",
		value: "game",
		resourceEndPoint: "game",
		//config is used in API config
		configKey: "game",
	},
	{
		label: "Tour",
		value: "tour",
		resourceEndPoint: "tour",
		//config is used in API config
		configKey: "tour",
	},
	{
		label: "Newsletter signup",
		value: "newslettersignup",
		resourceEndPoint: "newslettersignup",
		//config is used in API config
		configKey: "newslettersignup",
	},
	{
		label: "Event",
		value: "event",
		resourceEndPoint: "event",
		//config is used in API config
		configKey: "event",
	},
	{
		label: "Statistics",
		value: "statistics",
		resourceEndPoint: "statistics",
		//config is used in API config
		configKey: "statistics",
	},
	{
		label: "Actions",
		value: "action",
		resourceEndPoint: "action",
		//config is used in API config
		configKey: "action",
	},
	{
		label: "Invoice",
		value: "invoice",
		resourceEndPoint: "invoice",
		//config is used in API config
		configKey: "invoice",
	},
];

exports.schemaFormat = resources;
