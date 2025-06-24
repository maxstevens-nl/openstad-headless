import ResourceForm from "@/components/resource-form";
import { PageLayout } from "@/components/ui/page-layout";
import useResources from "@/hooks/use-resources";
import { useRouter } from "next/router";

export default function ProjectResourceCreate() {
	const router = useRouter();
	const { project } = router.query;
	const { create } = useResources(project as string);

	return (
		<div>
			<PageLayout
				pageHeader="Resources"
				breadcrumbs={[
					{
						name: "Projecten",
						url: "/projects",
					},
					{
						name: "Resources",
						url: `/projects/${project}/resources`,
					},
					{
						name: "Resource toevoegen",
						url: `/projects/${project}/resources/create`,
					},
				]}
			>
				<ResourceForm onFormSubmit={(body) => create(body)} />
			</PageLayout>
		</div>
	);
}
