import { validateProjectNumber } from "@/lib/validateProjectNumber";

export default function useChoiceGuideResults(projectId?: string) {
	const projectNumber: number | undefined = validateProjectNumber(projectId);

	const url = `/api/openstad/api/project/${projectNumber}/choicesguide`;

	async function remove(id: string | number) {
		const res = await fetch(`${url}/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			throw new Error("Could not remove the choiceguide result");
		}
	}

	return { remove };
}
