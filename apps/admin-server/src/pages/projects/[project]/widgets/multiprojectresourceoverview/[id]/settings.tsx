import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import useProjectList from "@/hooks/use-project-list";
import type { EditFieldProps } from "@/lib/form-widget-helpers/EditFieldProps";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MultiProjectResourceOverviewProps } from "@openstad-headless/multi-project-resource-overview/src/multi-project-resource-overview";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	selectedProjects: z
		.array(
			z.object({
				id: z.any(),
				name: z.string(),
				detailPageLink: z.string().optional(),
				label: z.string().optional(),
			}),
		)
		.optional(),
});

export default function WidgetMultiProjectSettings(
	props: MultiProjectResourceOverviewProps &
		EditFieldProps<MultiProjectResourceOverviewProps>,
) {
	type FormData = z.infer<typeof formSchema>;

	const { data: projects } = useProjectList();
	const defaultValues = { selectedProjects: props.selectedProjects || [] };

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	async function onSubmit(values: FormData) {
		const updatedValues = {
			...values,
			selectedProjects:
				values.selectedProjects?.map((project) => ({
					...project,
					id: project.id || 0,
				})) || [],
		};
		props.updateConfig({ ...props, ...updatedValues });
	}

	return (
		<div className="p-6 bg-white rounded-md">
			<Form {...form}>
				<Heading size="xl">
					Instellingen voor het &apos;Multi project inzendingen overzicht&apos;
				</Heading>
				<FormDescription>
					Selecteer de projecten die je wilt tonen in het overzicht.
					<br />
					Je kunt per project een link naar de detailpagina en een label voor in
					het overzicht opgeven.
					<br />
					Voor de detailpagina kun je linken naar de juiste inzending door [id]
					te gebruiken, bijvoorbeeld /resources/[id]
				</FormDescription>
				<Separator className="my-4" />
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="lg:w-full grid grid-cols-1 gap-4"
				>
					{projects?.map((project: any) => (
						<FormField
							key={project.id}
							control={form.control}
							name="selectedProjects"
							render={({ field }) => {
								const isChecked = field.value?.some((p) => p.id === project.id);
								return (
									<FormItem
										className={"lg:w-full flex-row items-center gap-x-2"}
									>
										<FormControl>
											<input
												type="checkbox"
												id={project.id}
												checked={isChecked}
												onChange={(e) => {
													const updatedProjects = isChecked
														? field.value?.filter((p) => p.id !== project.id) ||
															[]
														: [
																...(field.value || []),
																{
																	id: project.id,
																	name: project.name,
																	detailPageLink: "",
																	label: "",
																},
															];
													field.onChange(updatedProjects);
												}}
											/>
										</FormControl>
										<FormLabel
											style={{
												marginTop: "0",
												whiteSpace: "nowrap",
												width: "400px",
											}}
											htmlFor={project.id}
										>
											{project.name}
										</FormLabel>
										<FormMessage />
										<div
											className="lg:w-full flex flex-row items-center gap-x-2"
											style={{
												marginLeft: "40px",
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												columnGap: "30px",
											}}
										>
											<FormField
												control={form.control}
												name={`selectedProjects.${field.value?.findIndex((p) => p.id === project.id) ?? 0}.detailPageLink`}
												render={({ field }) => (
													<FormItem>
														<FormLabel
															style={{
																opacity: `${isChecked ? 1 : 0.3}`,
																pointerEvents: `${isChecked ? "auto" : "none"}`,
																cursor: `${isChecked ? "auto" : "not-allowed"}`,
															}}
														>
															Detailpagina link
														</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="text"
																style={{
																	opacity: `${isChecked ? 1 : 0.3}`,
																	pointerEvents: `${isChecked ? "auto" : "none"}`,
																	cursor: `${isChecked ? "auto" : "not-allowed"}`,
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={`selectedProjects.${field.value?.findIndex((p) => p.id === project.id) ?? 0}.label`}
												render={({ field }) => (
													<FormItem>
														<FormLabel
															style={{
																opacity: `${isChecked ? 1 : 0.3}`,
																pointerEvents: `${isChecked ? "auto" : "none"}`,
																cursor: `${isChecked ? "auto" : "not-allowed"}`,
															}}
														>
															Label in overzicht
														</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="text"
																style={{
																	opacity: `${isChecked ? 1 : 0.3}`,
																	pointerEvents: `${isChecked ? "auto" : "none"}`,
																	cursor: `${isChecked ? "auto" : "not-allowed"}`,
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</FormItem>
								);
							}}
						/>
					))}
					<Button className="w-fit col-span-full" type="submit">
						Opslaan
					</Button>
				</form>
			</Form>
		</div>
	);
}
