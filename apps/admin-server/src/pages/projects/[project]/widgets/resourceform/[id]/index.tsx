import WidgetPreview from "@/components/widget-preview";
import WidgetPublish from "@/components/widget-publish";
import { useWidgetConfig } from "@/hooks/use-widget-config";
import { useWidgetPreview } from "@/hooks/useWidgetPreview";
import {
	type WithApiUrlProps,
	withApiUrl,
} from "@/lib/server-side-props-definition";
import WidgetResourceFormItems from "@/pages/projects/[project]/widgets/resourceform/[id]/items";
import type { ResourceFormWidgetProps } from "@openstad-headless/resource-form/src/props";
import { useRouter } from "next/router";
import { PageLayout } from "../../../../../../components/ui/page-layout";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../../../../../components/ui/tabs";
import WidgetResourceFormConfirmation from "./confirmation";
import WidgetResourceFormGeneral from "./general";
import WidgetResourceFormInfo from "./info";
import WidgetResourceFormSubmit from "./submit";

export const getServerSideProps = withApiUrl;
export default function WidgetResourceForm({ apiUrl }: WithApiUrlProps) {
	const router = useRouter();
	const id = router.query.id;
	const projectId = router.query.project as string;

	const { data: widget, updateConfig } =
		useWidgetConfig<ResourceFormWidgetProps>();
	const { previewConfig, updatePreview } =
		useWidgetPreview<ResourceFormWidgetProps>({
			projectId,
		});

	return (
		<div>
			<PageLayout
				pageHeader="Projectnaam"
				breadcrumbs={[
					{
						name: "Projecten",
						url: "/projects",
					},
					{
						name: "Widgets",
						url: `/projects/${projectId}/widgets`,
					},
					{
						name: "Inzending formulier",
						url: `/projects/${projectId}/widgets/resourceform/${id}`,
					},
				]}
			>
				<div className="container py-6 overflow-hidden">
					<Tabs defaultValue="general">
						<TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
							<TabsTrigger value="general">Algemeen</TabsTrigger>
							<TabsTrigger value="items">Formulier velden</TabsTrigger>
							<TabsTrigger value="submit">Opleveren</TabsTrigger>
							<TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
							<TabsTrigger value="info">Weergave</TabsTrigger>
							<TabsTrigger value="publish">Publiceren</TabsTrigger>
						</TabsList>
						<TabsContent value="preview" className="p-0" />
						<TabsContent value="general" className="p-0">
							<WidgetResourceFormGeneral />
						</TabsContent>
						<TabsContent value="items" className="p-0">
							{previewConfig && (
								<WidgetResourceFormItems
									{...previewConfig}
									updateConfig={(config) =>
										updateConfig({ ...widget.config, ...config })
									}
									onFieldChanged={(key: string, value: any) => {
										if (previewConfig) {
											updatePreview({
												...previewConfig,
												[key]: value,
											});
										}
									}}
								/>
							)}
						</TabsContent>
						<TabsContent value="submit" className="p-0">
							<WidgetResourceFormSubmit />
						</TabsContent>
						<TabsContent value="confirmation" className="p-0">
							<WidgetResourceFormConfirmation />
						</TabsContent>
						<TabsContent value="info" className="p-0">
							<WidgetResourceFormInfo />
						</TabsContent>
						<TabsContent value="publish" className="p-0">
							<WidgetPublish apiUrl={apiUrl} />
						</TabsContent>
					</Tabs>

					<div className="py-6 mt-6 bg-white rounded-md">
						{previewConfig ? (
							<WidgetPreview
								type="resourceform"
								config={previewConfig}
								projectId={projectId as string}
							/>
						) : null}
					</div>
				</div>
			</PageLayout>
		</div>
	);
}
