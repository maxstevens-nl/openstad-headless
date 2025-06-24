import "./resource-overview.css";
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from "@openstad-headless/data-store/src";
import { ResourceOverviewMap } from "@openstad-headless/leaflet-map/src/resource-overview-map";
import { loadWidget } from "@openstad-headless/lib/load-widget";
import type { BaseProps, ProjectSettingProps } from "@openstad-headless/types";
import { Carousel, Icon, Paginator } from "@openstad-headless/ui/src";
import { Spacer } from "@openstad-headless/ui/src";
import { Image } from "@openstad-headless/ui/src";
import { Dialog } from "@openstad-headless/ui/src";
import { Filters } from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";
import React, { useCallback, useEffect, useState } from "react";
import { elipsizeHTML } from "../../lib/ui-helpers";
import { GridderResourceDetail } from "./gridder-resource-detail";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import type {
	ResourceOverviewMapWidgetProps,
	dataLayerArray,
} from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";
import { renderRawTemplate } from "@openstad-headless/raw-resource/includes/template-render";
import { Heading4, Paragraph } from "@utrecht/component-library-react";

export type ResourceOverviewWidgetProps = BaseProps &
	ProjectSettingProps & {
		projectId?: string;
	} & {
		resourceOverviewMapWidget?: Omit<
			ResourceOverviewMapWidgetProps,
			keyof BaseProps | keyof ProjectSettingProps | "projectId"
		> &
			dataLayerArray;
		renderHeader?: (
			widgetProps: ResourceOverviewWidgetProps,
			resources?: any,
			title?: string,
			displayHeader?: boolean,
			displayMap?: boolean,
		) => React.JSX.Element;
		renderItem?: (
			resource: any,
			props: ResourceOverviewWidgetProps,
			onItemClick?: () => void,
		) => React.JSX.Element;
		resourceType?: "resource";
		displayPagination?: boolean;
		displayType?: "cardrow" | "cardgrid" | "raw";
		allowFiltering?: boolean;
		displayTitle?: boolean;
		displayStatusLabel?: boolean;
		titleMaxLength?: number;
		displayRanking?: boolean;
		displayLabel?: boolean;
		displaySummary?: boolean;
		summaryMaxLength?: number;
		displayDescription?: boolean;
		descriptionMaxLength?: number;
		displayArguments?: boolean;
		displayVote?: boolean;
		displayShareButtons?: boolean;
		displayEditLink?: boolean;
		displayCaption?: boolean;
		summaryCharLength?: number;
		displaySorting?: boolean;
		defaultSorting?: string;
		displaySearch?: boolean;
		displaySearchText?: boolean;
		textActiveSearch?: string;
		searchPlaceholder?: string;
		itemLink?: string;
		sorting: Array<{ value: string; label: string }>;
		displayTagFilters?: boolean;
		tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
		displayTagGroupName?: boolean;
		displayBanner?: boolean;
		displayMap?: boolean;
		itemsPerPage?: number;
		textResults?: string;
		onlyIncludeTagIds?: string;
		onlyIncludeStatusIds?: string;
		rawInput?: string;
		bannerText?: string;
		displayDocuments?: boolean;
		showActiveTags?: boolean;
		documentsTitle?: string;
		documentsDesc?: string;
		displayVariant?: string;
		resetText?: string;
		applyText?: string;
		onFilteredResourcesChange?: (filteredResources: any[]) => void;
		displayLikeButton?: boolean;
		clickableImage?: boolean;
		displayBudget?: boolean;
		displayTags?: boolean;
	};

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (
	widgetProps: ResourceOverviewWidgetProps,
	resources?: any,
	title?: string,
	displayHeader?: boolean,
	displayMap?: boolean,
) => {
	return (
		<>
			{displayMap && (
				<ResourceOverviewMap
					{...widgetProps}
					{...widgetProps.resourceOverviewMapWidget}
					givenResources={resources}
				/>
			)}
			{displayHeader && (
				<section className="osc-resource-overview-title-container">
					<Heading4>{title}</Heading4>
				</section>
			)}
		</>
	);
};

const defaultItemRenderer = (
	resource: any,
	props: ResourceOverviewWidgetProps,
	onItemClick?: () => void,
) => {
	if (props.displayType === "raw") {
		if (!props.rawInput) {
			return <Paragraph>Template is nog niet ingesteld</Paragraph>;
		}

		try {
			let render = renderRawTemplate(props, resource, "", false);
			render = render.replace(/&amp;amp;/g, "&");

			return (
				<div
					dangerouslySetInnerHTML={{
						__html: render,
					}}
				/>
			);
		} catch (e) {
			console.error("De template kon niet worden geparsed: ", e);
		}

		return <Paragraph>Er is een fout in de template</Paragraph>;
	}

	let defaultImage = "";

	interface Tag {
		name: string;
		defaultResourceImage?: string;
	}

	if (Array.isArray(resource?.tags)) {
		const sortedTags = resource.tags.sort((a: Tag, b: Tag) =>
			a.name.localeCompare(b.name),
		);

		const tagWithImage = sortedTags.find(
			(tag: Tag) => tag.defaultResourceImage,
		);
		defaultImage = tagWithImage?.defaultResourceImage || "";
	}

	const getUrl = () => {
		const location = document.location;
		let newUrl = props?.itemLink?.replace("[id]", resource.id);
		if (!newUrl?.startsWith("http")) {
			if (!newUrl?.startsWith("/")) {
				newUrl = `${location.pathname}${
					location.pathname.endsWith("/") ? "" : "/"
				}${newUrl}`;
			}
			newUrl = `${location.protocol}//${location.host}${newUrl}`;
		}
		return newUrl;
	};

	const resourceImages =
		Array.isArray(resource.images) && resource.images.length > 0
			? resource.images
			: [{ url: defaultImage }];
	const hasImages =
		Array.isArray(resourceImages) &&
		resourceImages.length > 0 &&
		resourceImages[0].url !== ""
			? ""
			: "resource-has-no-images";

	const firstStatus = resource.statuses
		? resource.statuses
				.filter(
					(status: { seqnr: number }) =>
						status.seqnr !== undefined && status.seqnr !== null,
				)
				.sort(
					(a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr,
				)[0] || resource.statuses[0]
		: false;

	const colorClass = firstStatus?.color ? `color-${firstStatus.color}` : "";
	const backgroundColorClass = firstStatus?.backgroundColor
		? `bgColor-${firstStatus.backgroundColor}`
		: "";

	const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

	return (
		<>
			{props.displayType === "cardrow" ? (
				<div className={`resource-card--link ${hasImages}`}>
					<Carousel
						items={resourceImages}
						buttonText={{
							next: "Volgende afbeelding",
							previous: "Vorige afbeelding",
						}}
						itemRenderer={(i) => (
							<Image
								src={i.url}
								imageFooter={
									props.displayStatusLabel && (
										<div className={`${hasImages} ${statusClasses}`}>
											<Paragraph className="osc-resource-overview-content-item-status">
												{resource.statuses?.map((statusTag: any) => (
													<span className="status-label">
														{statusTag.label}
													</span>
												))}
											</Paragraph>
										</div>
									)
								}
							/>
						)}
					/>

					<div>
						<Spacer size={1} />
						{props.displayTitle ? (
							<Heading4>
								<a
									href={getUrl()}
									className="resource-card--link_trigger"
									dangerouslySetInnerHTML={{
										__html: elipsizeHTML(
											resource.title,
											props.titleMaxLength || 20,
										),
									}}
								/>
							</Heading4>
						) : null}

						{props.displaySummary ? (
							<Paragraph
								dangerouslySetInnerHTML={{
									__html: elipsizeHTML(
										resource.summary,
										props.summaryMaxLength || 20,
									),
								}}
							/>
						) : null}

						{props.displayDescription ? (
							<Paragraph
								className="osc-resource-overview-content-item-description"
								dangerouslySetInnerHTML={{
									__html: elipsizeHTML(
										resource.description,
										props.descriptionMaxLength || 30,
									),
								}}
							/>
						) : null}
					</div>

					<div className="osc-resource-overview-content-item-footer">
						{props.displayVote ? (
							<>
								<Icon
									icon="ri-thumb-up-line"
									variant="big"
									text={resource.yes}
									description="Stemmen voor"
								/>
								<Icon
									icon="ri-thumb-down-line"
									variant="big"
									text={resource.no}
									description="Stemmen tegen"
								/>
							</>
						) : null}

						{props.displayArguments ? (
							<Icon
								icon="ri-message-line"
								variant="big"
								text={resource.commentCount}
								description="Aantal reacties"
							/>
						) : null}
					</div>
				</div>
			) : (
				<div className={`resource-card--link ${hasImages}`}>
					<Carousel
						items={resourceImages}
						buttonText={{
							next: "Volgende afbeelding",
							previous: "Vorige afbeelding",
						}}
						itemRenderer={(i) => (
							<Image
								src={i.url}
								imageFooter={
									props.displayStatusLabel && (
										<div className={`${hasImages} ${statusClasses}`}>
											<Paragraph className="osc-resource-overview-content-item-status">
												{resource.statuses?.map((statusTag: any) => (
													<span className="status-label">
														{statusTag.label}
													</span>
												))}
											</Paragraph>
										</div>
									)
								}
							/>
						)}
					/>

					<div>
						<Spacer size={1} />
						{props.displayTitle ? (
							<Heading4>
								<button
									className="resource-card--link_trigger"
									onClick={() => onItemClick?.()}
									dangerouslySetInnerHTML={{
										__html: elipsizeHTML(
											resource.title,
											props.titleMaxLength || 20,
										),
									}}
								/>
							</Heading4>
						) : null}

						{props.displaySummary ? (
							<Paragraph
								dangerouslySetInnerHTML={{
									__html: elipsizeHTML(
										resource.summary,
										props.summaryMaxLength || 20,
									),
								}}
							/>
						) : null}

						{props.displayDescription ? (
							<Paragraph
								className="osc-resource-overview-content-item-description"
								dangerouslySetInnerHTML={{
									__html: elipsizeHTML(
										resource.description,
										props.descriptionMaxLength || 30,
									),
								}}
							/>
						) : null}
					</div>

					<div className="osc-resource-overview-content-item-footer">
						{props.displayVote ? (
							<>
								<Icon
									icon="ri-thumb-up-line"
									variant="big"
									text={resource.yes}
								/>
								<Icon
									icon="ri-thumb-down-line"
									variant="big"
									text={resource.no}
								/>
							</>
						) : null}

						{props.displayArguments ? (
							<Icon
								icon="ri-message-line"
								variant="big"
								text={resource.commentCount}
							/>
						) : null}
					</div>
				</div>
			)}
		</>
	);
};

function ResourceOverview({
	renderItem = defaultItemRenderer,
	allowFiltering = true,
	displayType = "cardrow",
	displayBanner = false,
	displayMap = false,
	bannerText = "Plannen",
	renderHeader = defaultHeaderRenderer,
	itemsPerPage = 20,
	textResults = "Dit zijn de zoekresultaten voor [search]",
	onlyIncludeTagIds = "",
	onlyIncludeStatusIds = "",
	displayDocuments = false,
	showActiveTags = false,
	displayLikeButton = false,
	clickableImage = false,
	displayTags = true,
	displayBudget = true,
	documentsTitle = "",
	documentsDesc = "",
	displayVariant = "",
	onFilteredResourcesChange,
	...props
}: ResourceOverviewWidgetProps) {
	const datastore = new DataStore({
		projectId: props.projectId,
		api: props.api,
	});

	// const recourceTagsInclude = only
	const tagIdsToLimitResourcesTo = onlyIncludeTagIds
		.trim()
		.split(",")
		.filter((t) => t && !Number.isNaN(+t.trim()))
		.map((t) => Number.parseInt(t));

	const statusIdsToLimitResourcesTo = onlyIncludeStatusIds
		.trim()
		.split(",")
		.filter((t) => t && !Number.isNaN(+t.trim()))
		.map((t) => Number.parseInt(t));

	const [open, setOpen] = React.useState(false);

	// Filters that when changed reupdate the useResources value automatically
	const [search, setSearch] = useState<string>("");
	const [statuses, setStatuses] = useState<number[]>(
		statusIdsToLimitResourcesTo || [],
	);
	const [tags, setTags] = useState<number[]>(tagIdsToLimitResourcesTo || []);
	const [page, setPage] = useState<number>(0);
	const [totalPages, setTotalPages] = useState(0);
	const [pageSize, setPageSize] = useState<number>(itemsPerPage || 10);
	const [sort, setSort] = useState<string | undefined>(
		props.defaultSorting || undefined,
	);

	const [resources, setResources] = useState([]);
	const [filteredResources, setFilteredResources] = useState([]);

	const { data: resourcesWithPagination } = datastore.useResources({
		pageSize: 999999,
		...props,
		search,
		tags,
		sort,
	});

	const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

	useEffect(() => {
		if (resourcesWithPagination) {
			setResources(resourcesWithPagination.records || []);
		}
	}, [resourcesWithPagination, pageSize]);

	const { data: allTags } = datastore.useTags({
		projectId: props.projectId,
		type: "",
	});

	useEffect(() => {
		// @ts-ignore
		const intTags = tags.map((tag) => Number.parseInt(tag, 10));

		const groupedTags: { [key: string]: number[] } = {};

		intTags.forEach((tagId) => {
			// @ts-ignore
			const tag = allTags.find((tag) => tag.id === tagId);
			if (tag) {
				const tagType = tag.type;
				if (!groupedTags[tagType]) {
					groupedTags[tagType] = [];
				}
				groupedTags[tagType].push(tagId);
			}
		});

		const filtered =
			resources &&
			(Object.keys(groupedTags).length === 0
				? resources
				: resources.filter((resource: any) => {
						return Object.keys(groupedTags).every((tagType) => {
							return groupedTags[tagType].some(
								(tagId) =>
									resource.tags &&
									Array.isArray(resource.tags) &&
									resource.tags.some((o: { id: number }) => o.id === tagId),
							);
						});
					})
			)
				?.filter(
					(resource: any) =>
						!statusIdsToLimitResourcesTo ||
						statusIdsToLimitResourcesTo.length === 0 ||
						statusIdsToLimitResourcesTo.some(
							(statusId) =>
								resource.statuses &&
								Array.isArray(resource.statuses) &&
								resource.statuses.some(
									(o: { id: number }) => o.id === statusId,
								),
						),
				)
				?.sort((a: any, b: any) => {
					if (sort === "createdAt_desc") {
						return (
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
						);
					}
					if (sort === "createdAt_asc") {
						return (
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
						);
					}
					return 0;
				});

		setFilteredResources(filtered);
	}, [resources, tags, statuses, search, sort, allTags]);

	useEffect(() => {
		if (filteredResources) {
			const filtered: any = filteredResources || [];
			const totalPagesCalc = Math.ceil(filtered?.length / pageSize);

			if (totalPagesCalc !== totalPages) {
				setTotalPages(totalPagesCalc);
			}

			setPage(0);

			if (onFilteredResourcesChange) {
				onFilteredResourcesChange(filtered);
			}
		}
	}, [filteredResources]);

	const { data: currentUser } = datastore.useCurrentUser({ ...props });

	const onResourceClick = useCallback(
		(resource: any, index: number) => {
			if (displayType === "cardrow") {
				if (!props.itemLink) {
					console.error("Link to child resource is not set");
				} else {
					const location = document.location;
					let newUrl = props.itemLink.replace("[id]", resource.id);
					if (!newUrl.startsWith("http")) {
						if (!newUrl.startsWith("/")) {
							newUrl = `${location.pathname}${
								location.pathname.endsWith("/") ? "" : "/"
							}${newUrl}`;
						}
						newUrl = `${location.protocol}//${location.host}${newUrl}`;
					}
					document.location.href = newUrl;
				}
			}

			if (displayType === "cardgrid") {
				setResourceDetailIndex(index);
				setOpen(true);
			}
		},
		[displayType, props.itemLink],
	);

	const filterNeccesary =
		allowFiltering &&
		(props.displaySearch || props.displaySorting || props.displayTagFilters);

	const getDisplayVariant = (variant: string) => {
		if (!variant) {
			return " ";
		}
		return ` --${variant}`;
	};

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={setOpen}
				children={
					<Carousel
						startIndex={resourceDetailIndex}
						items={
							filteredResources && filteredResources?.length > 0
								? filteredResources
								: []
						}
						buttonText={{
							next: "Volgende afbeelding",
							previous: "Vorige afbeelding",
						}}
						itemRenderer={(item) => (
							<GridderResourceDetail
								resource={item}
								currentUser={currentUser}
								displayDocuments={displayDocuments}
								documentsTitle={documentsTitle}
								documentsDesc={documentsDesc}
								displayTags={displayTags}
								displayBudget={displayBudget}
								displayLikeButton={displayLikeButton}
								clickableImage={clickableImage}
								onRemoveClick={(resource) => {
									try {
										resource
											.delete(resource.id)
											.then(() => setOpen(false))
											.catch((e: any) => {
												console.error(e);
											});
									} catch (e) {
										console.error(e);
									}
								}}
								{...props}
							/>
						)}
					/>
				}
			/>

			<div className={`osc ${getDisplayVariant(displayVariant)}`}>
				{displayBanner || displayMap
					? renderHeader(
							props,
							filteredResources || [],
							bannerText,
							displayBanner,
							displayMap,
						)
					: null}

				<section
					className={`osc-resource-overview-content ${
						!filterNeccesary ? "full" : ""
					}`}
				>
					{props.displaySearchText ? (
						<div className="osc-resourceoverview-search-container col-span-full">
							{props.textActiveSearch && search && (
								<Paragraph className="osc-searchtext" role="status">
									{props.textActiveSearch
										.replace("[search]", search)
										.replace("[zoekterm]", search)}
								</Paragraph>
							)}
						</div>
					) : null}

					{filterNeccesary && datastore ? (
						<Filters
							className="osc-flex-columned"
							tagsLimitation={tagIdsToLimitResourcesTo}
							dataStore={datastore}
							sorting={props.sorting || []}
							displaySorting={props.displaySorting || false}
							defaultSorting={props.defaultSorting || ""}
							displayTagFilters={props.displayTagFilters || false}
							displaySearch={props.displaySearch || false}
							searchPlaceholder={props.searchPlaceholder || "Zoeken"}
							resetText={props.resetText || "Reset"}
							applyText={props.applyText || "Toepassen"}
							tagGroups={props.tagGroups || []}
							itemsPerPage={itemsPerPage}
							resources={resources}
							showActiveTags={showActiveTags}
							onUpdateFilter={(f) => {
								if (f.tags.length === 0) {
									setTags(tagIdsToLimitResourcesTo);
								} else {
									setTags(f.tags);
								}
								if (["createdAt_desc", "createdAt_asc"].includes(f.sort)) {
									setSort(f.sort);
								}
								setSearch(f.search.text);
							}}
						/>
					) : null}

					<section className="osc-resource-overview-resource-collection">
						{filteredResources
							?.slice(page * pageSize, (page + 1) * pageSize)
							?.map((resource: any, index: number) => {
								return (
									<React.Fragment key={`resource-item-${resource.id}`}>
										{renderItem(resource, { ...props, displayType }, () => {
											onResourceClick(resource, index);
										})}
									</React.Fragment>
								);
							})}
					</section>
				</section>
				{props.displayPagination && (
					<>
						<Spacer size={4} />
						<div className="osc-resource-overview-paginator col-span-full">
							<Paginator
								page={page || 0}
								totalPages={totalPages || 1}
								onPageChange={(newPage) => setPage(newPage)}
							/>
						</div>
					</>
				)}
			</div>
		</>
	);
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
