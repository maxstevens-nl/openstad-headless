import type { NextApiRequest, NextApiResponse } from "next";
import { type SessionUserType, getSession } from "../../auth";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<SessionUserType>,
) {
	const session = await getSession(req, res);
	let data: SessionUserType = {};
	data = {
		id: session.user?.id,
		name: session.user?.name,
		role: session.user?.role,
		jwt: session.user?.jwt,
	};

	res.status(200).json(data);
}
