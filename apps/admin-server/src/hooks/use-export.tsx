import { validateProjectNumber } from "@/lib/validateProjectNumber";
import useSWR from "swr";

export default function useExport(projectId?: string) {
	const projectNumber: number | undefined = validateProjectNumber(projectId);

	const url = `/api/openstad/api/project/${projectNumber}/export`;

	const exportSWR = useSWR(projectNumber ? url : null);

	return { ...exportSWR };
}
