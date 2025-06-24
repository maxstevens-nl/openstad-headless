export default {
	fetch: async function ({ projectId, userId }) {
		const url = `/api/project/${projectId}/user/${userId}/activity?includeOtherProjects=1`;
		const headers = {
			"Content-Type": "application/json",
		};

		return this.fetch(url, { headers });
	},
};
