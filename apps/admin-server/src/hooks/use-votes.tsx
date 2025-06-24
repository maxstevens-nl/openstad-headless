import { validateProjectNumber } from "@/lib/validateProjectNumber";
import useSWR from "swr";

export default function useVotes(projectId?: string) {
	const projectNumber: number | undefined = validateProjectNumber(projectId);

	const url = `/api/openstad/api/project/${projectNumber}/vote`;

	const { data, isLoading, error, mutate } = useSWR(projectNumber ? url : null);

	async function remove(id: string | number) {
		const res = await fetch(`${url}/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (res.ok) {
			const existingData = [...data];
			const updatedList = existingData.filter((ed) => ed.id !== id);
			mutate(updatedList);
			return updatedList;
		}
		throw new Error("Could not remove the vote");
	}

	return { data, isLoading, error, remove };
}
