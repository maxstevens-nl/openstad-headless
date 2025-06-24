import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { StemcodeProvider } from "./stemcode";
import { StemcodeUI } from "./stemcode-ui.jsx";
import { subjects } from "./subjects";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";

CodeProvider;
PasswordProvider

async function getUser(email: string) {
	// Get user from database and return user ID
	return "123";
}

export default issuer({
	subjects,
	storage: MemoryStorage(),
	providers: {
		stemcode: StemcodeProvider(
			StemcodeUI({
				sendCode: async (email, code) => {
					console.log(email, code);
				},
			}),
		),
	},
	success: async (ctx, value) => {
		if (value.provider === "stemcode") {
			return ctx.subject("user", {
				id: await getUser(value.stemcode),
			});
		}
		throw new Error("Invalid provider");
	},
});
