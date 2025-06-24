import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/typography";
import type { EditFieldProps } from "@/lib/form-widget-helpers/EditFieldProps";
import type { ArgumentWidgetTabProps } from "@/pages/projects/[project]/widgets/comments/[id]/index";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Defines the types allowed to go to the frontend
const SortingTypes = [
	{
		value: "createdAt_desc",
		label: "Nieuwste eerst",
	},
	{
		value: "createdAt_asc",
		label: "Oudste eerst",
	},
];

const formSchema = z.object({
	defaultSorting: z.string().optional(),
	sorting: z
		.array(z.object({ value: z.string(), label: z.string() }))
		.optional(),
});

export default function ArgumentsSorting(
	props: ArgumentWidgetTabProps & EditFieldProps<ArgumentWidgetTabProps>,
) {
	type FormData = z.infer<typeof formSchema>;

	async function onSubmit(values: FormData) {
		props.updateConfig({ ...props, ...values });
	}

	const form = useForm<FormData>({
		resolver: zodResolver<any>(formSchema),
		defaultValues: {
			defaultSorting: props?.defaultSorting || "createdAt_asc",
			sorting: props?.sorting || [],
		},
	});

	return (
		<div className="p-6 bg-white rounded-md">
			<Form {...form}>
				<Heading size="xl">Sorteren</Heading>
				<Separator className="my-4" />
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-2 gap-4"
				>
					<FormField
						control={form.control}
						name="defaultSorting"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Standaard manier van sorteren</FormLabel>
								<Select
									onValueChange={(value) => {
										field.onChange(value);
										props.onFieldChanged(field.name, value);
									}}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Nieuwste eerst" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{SortingTypes.map((sort) => (
											<SelectItem
												key={`sort-type-${sort.value}`}
												value={sort.value}
											>
												{sort.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="sorting"
						render={() => (
							<FormItem className="col-span-full">
								<div>
									<FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
								</div>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
									{SortingTypes.map((item) => (
										<FormField
											key={item.value}
											control={form.control}
											name="sorting"
											render={({ field }) => {
												return (
													<FormItem
														key={item.value}
														className="flex flex-row items-start space-x-3 space-y-0"
													>
														<FormControl>
															<Checkbox
																checked={field.value?.some(
																	(el) => el.value === item.value,
																)}
																onCheckedChange={(checked: boolean) => {
																	const newValue = checked
																		? [
																				...(field.value || []),
																				{
																					value: item.value,
																					label: item.label,
																				},
																			]
																		: (field.value || []).filter(
																				(val) => val.value !== item.value,
																			);

																	field.onChange(newValue);
																	props.onFieldChanged(field.name, newValue);
																}}
															/>
														</FormControl>
														<FormLabel className="font-normal">
															{item.label}
														</FormLabel>
													</FormItem>
												);
											}}
										/>
									))}
								</div>
							</FormItem>
						)}
					/>
					<Button className="w-fit col-span-full" type="submit">
						Opslaan
					</Button>
				</form>
			</Form>
		</div>
	);
}
