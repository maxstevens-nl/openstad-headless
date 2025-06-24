import { validateProjectNumber } from "@/lib/validateProjectNumber";
import useSWR from "swr";

export default function useResources(projectId?: string) {
	const projectNumber: number | undefined = validateProjectNumber(projectId);

	const url = `/api/openstad/api/project/${projectNumber}/resource?includeUserVote=1&includeVoteCount=1`;

	const resourcesListSwr = useSWR(projectNumber ? url : null);

	async function create(body: any) {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...body }),
		});

		if (res.ok) {
			const data = await res.json();
			resourcesListSwr.mutate([...resourcesListSwr.data, data]);
			return data;
		}
		throw new Error("Could not create the plan");
	}

	async function update(id: number, body: any) {
		const updateUrl = `/api/openstad/api/project/${projectNumber}/resource/${id}?includeUserVote=1`;

		const res = await fetch(updateUrl, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...body }),
		});

		if (res.ok) {
			const data = await res.json();
			const existingData = [...resourcesListSwr.data];
			const updatedList = existingData.filter((ed) => ed.id !== data.id);
			updatedList.push(data);
			resourcesListSwr.mutate(updatedList);
			return data;
		}
		throw new Error("Could not update the plan");
	}

	async function remove(id: number) {
		const deleteUrl = `/api/openstad/api/project/${projectNumber}/resource/${id}?includeUserVote=1`;

		const res = await fetch(deleteUrl, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (res.ok) {
			const existingData = [...resourcesListSwr.data];
			const updatedList = existingData.filter((ed) => ed.id !== id);
			resourcesListSwr.mutate(updatedList);
			return updatedList;
		}
		throw new Error("Could not remove the plan");
	}
	return { ...resourcesListSwr, create, update, remove };
}
