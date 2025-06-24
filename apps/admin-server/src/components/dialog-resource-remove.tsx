import { DialogClose } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Heading, Paragraph } from "@/components/ui/typography";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

type Props = {
	header: string;
	message: string;
	deleteButtonText?: string;
	cancelButtonText?: string;
	onDeleteAccepted: () => void;
};

export function RemoveResourceDialog({
	header,
	message,
	deleteButtonText = "Verwijderen",
	cancelButtonText = "Annuleren",
	onDeleteAccepted,
}: Props) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Dialog open={open} modal={true} onOpenChange={setOpen}>
			<div
				className="flex items-center"
				onClick={(e) => {
					e.preventDefault();
					setOpen(true);
				}}
			>
				<Trash className="mr-2 h-4 w-4" /> Verwijder
			</div>
			<DialogContent
				onEscapeKeyDown={(e: KeyboardEvent) => {
					e.stopPropagation();
				}}
				onInteractOutside={(e: Event) => {
					e.stopPropagation();
					setOpen(false);
				}}
			>
				<div>
					<Heading size={"lg"}>{header}</Heading>
					<Paragraph className="mb-8">{message}</Paragraph>
					<DialogFooter>
						<DialogClose asChild>
							<Button
								onClick={(e) => {
									e.preventDefault();
									setOpen(false);
								}}
								type="button"
								variant="ghost"
							>
								{cancelButtonText}
							</Button>
						</DialogClose>

						<Button
							type="button"
							variant={"destructive"}
							onClick={(e) => {
								e.preventDefault();
								onDeleteAccepted?.();
								setOpen(false);
							}}
						>
							{deleteButtonText}
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
