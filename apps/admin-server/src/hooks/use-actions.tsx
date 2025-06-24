import { validateProjectNumber } from "@/lib/validateProjectNumber";
import useSWR from "swr";

export default function useActions(projectId?: string) {
	const projectNumber: number | undefined = validateProjectNumber(projectId);

	const url = `/api/openstad/api/project/${projectNumber}/action`;

	const actionListSwr = useSWR(projectNumber ? url : null);

	return { ...actionListSwr };
}
