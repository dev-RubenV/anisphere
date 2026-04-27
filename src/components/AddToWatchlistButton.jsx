'use client'
import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, HeartIcon, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { toast } from "sonner"

export function AddToWatchlistButton({ anime, userData, iconOnly = false}) {
    const { user } = useAuth();
    const router = useRouter();

    const [watchlist, setWatchlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdded, setIsAdded] = useState(!!userData);

    const [status, setStatus] = useState(userData?.status || 'Watching');
    const [score, setScore] = useState(userData?.user_score || 0.0);
    const [progress, setProgress] = useState(userData?.progress ||0);
    const [image_url, setImageURL] = useState(userData?.image_url || "");
    const [isFavorite, setIsFavorite] = useState(userData?.isFavorite || false);
    const [notes, setNotes] = useState(userData?.notes || '');

    const handleAdd = async (e) => {
        e.preventDefault();

        if (!user) {
            router.push("/login");
            return;
        }

        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    anime: anime,
                    userId: user.id || user._id,
                    username: user.displayName,
                    user_score: score,
                    status: status,
                    image_url: image_url,
                    progress: progress,
                    isFavorite: isFavorite,
                    notes: notes
                })
            });

            if (res.ok) {
                setIsAdded(true);
                router.refresh();

                toast(isAdded ? `${anime.title_english || anime.title} has been updated successfully` : `${anime.title_english || anime.title} has been added to your list successfully`);
            }

        } catch (error) {
            console.error("Failed to add", error);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();

        if (!user) {
            router.push("/login");
            return;
        }

        try{
            const res = await fetch("/api/watchlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    anime: anime,
                    userId:  user.id || user._id,
                })
            });
            if (res.ok) {
                toast(anime.title_english || anime.title, {
                    description: "Has been deleted successfully from your list"})

                window.location.reload()
            }
        } catch(error) {
            console.error("Error while removing entry from watchlist", error);
        }

    }

    const handleProgress = (e) => {

        if (e === "" || e < 0 || !e){
            e = 0;
        }

        if (e > anime.episodes){
            e = anime.episodes;
        }

        setProgress(e);
    }

    const handleScores = (e) => {

        if (e === "") {
            setScore("");
            return;
        }

        if (!/^[0-9]*[.,]?[0-9]*$/.test(e)) {
            return;
        }

        const num = parseFloat(e.replace(',', '.'));

        if (num > 10) {
            setScore(10);
            return;
        }

        setScore(e);
    }

    if(user) {
        return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button
                            className={`cursor-pointer text-white transition-all bg-[#FD8D32] hover:bg-[#e07a28] hover:-translate-y-0.5 shadow-sm ${iconOnly ? 'w-9 h-9 mt-1 p-0 rounded-md flex items-center justify-center' : 'w-full'}`}
                        >
                            {isAdded ? (iconOnly ? <PencilIcon/> : <><PencilIcon className="w-4 h-4 mr-2"/>Edit</>) : (iconOnly ? <PlusIcon className="w-4 h-4"/> : <><PlusIcon className="w-4 h-4 mr-2"/> Add</>)}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-white border-[#DCC1B1] text-[#1A202E]">
                    <p>{isAdded ? "Edit entry" : "Add to list"}</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-[425px] bg-white border-[#DCC1B1]/30 shadow-xl rounded-xl">

                <DialogHeader>
                    <DialogTitle className="text-[#1A202E] font-bold text-xl">{isAdded ? "Edit" : "Add"} anime to list</DialogTitle>

                    <DialogDescription className="text-[#4A5568]">
                        Make changes to your list here. Click save when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-2">
                    <div className="grid grid-cols-6 gap-4">
                        <Field className="col-span-2">
                            <FieldLabel htmlFor="score" className="text-[#1A202E] font-medium text-sm mb-1.5 flex justify-between">Score <span className="text-[#4A5568]">{score} / 10</span></FieldLabel>
                            <Input className="border-[#D8DADC] focus-visible:ring-[#FD8D32]/30 focus-visible:border-[#FD8D32]" id="score" placeholder=' ' value={score} inputMode="decimal" onChange={(e) => handleScores(e.target.value)} step="0.5" type="text" />
                        </Field>
                        <Field className={`flex ${isAdded ? 'col-span-3':'col-span-4'} items-end`}>
                            <FieldLabel htmlFor="favorite" className="hidden">Favorite</FieldLabel>
                            <Toggle
                                onPressedChange={setIsFavorite}
                                pressed={isFavorite}
                                aria-label="Toggle favorite"
                                size="sm"
                                variant="outline"
                                className="w-full cursor-pointer border-[#D8DADC] text-[#4A5568] hover:bg-[#F8FAFC] data-[state=on]:bg-[#FD8D32]/10 data-[state=on]:text-[#954A00] data-[state=on]:border-[#FD8D32]/30 transition-all h-[42px]"
                            >
                                <HeartIcon className={`w-4 h-4 mr-2 ${isFavorite ? "fill-[#FD8D32] text-[#FD8D32]" : ""}`} />
                                {!isFavorite ? "Add to" : "Remove"} Favorites
                            </Toggle>
                        </Field>
                        { isAdded && (
                        <Field className="flex flex-col items-end">
                            <AlertDialog>
                                <FieldLabel htmlFor="delete" className="hidden">Delete</FieldLabel>
                                <AlertDialogTrigger id="delete" asChild>
                                    <Button
                                        className="w-full h-[42px] cursor-pointer text-[#BA1A1A] bg-[#BA1A1A]/10 hover:bg-[#BA1A1A]/20 hover:text-[#93000A] border border-[#BA1A1A]/20"
                                        variant="outline"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white border-[#DCC1B1]/30 rounded-xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-[#1A202E] font-bold">Remove from list?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-[#4A5568]">
                                            This will permanently remove this anime from your watchlist.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer border-[#DCC1B1] hover:bg-[#F2F4F6] text-[#4A5568]">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRemove} className="cursor-pointer bg-[#BA1A1A] hover:bg-[#93000A] text-white">Remove</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Field>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="status" className="text-[#1A202E] font-medium text-sm mb-1.5 block">Status</FieldLabel>
                            <Select onValueChange={setStatus} defaultValue={status}>
                                <SelectTrigger className="w-full border-[#D8DADC] focus:ring-[#FD8D32]/30 focus:border-[#FD8D32]">
                                    <SelectValue placeholder="Watching" value={status}/>
                                </SelectTrigger>
                                <SelectContent className="bg-white border-[#DCC1B1]/50">
                                    <SelectItem value="Watching" className="focus:bg-[#EDF2F7]">Watching</SelectItem>
                                    <SelectItem value="Plan to watch" className="focus:bg-[#EDF2F7]">Plan to watch</SelectItem>
                                    <SelectItem value="Completed" className="focus:bg-[#EDF2F7]">Completed</SelectItem>
                                    <SelectItem value="Dropped" className="focus:bg-[#EDF2F7]">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="episodes" className="text-[#1A202E] font-medium text-sm mb-1.5 flex justify-between">Watched <span className="text-[#4A5568]">{progress} / {anime.episodes || '?'}</span></FieldLabel>
                            <Input className="border-[#D8DADC] focus-visible:ring-[#FD8D32]/30 focus-visible:border-[#FD8D32]" id="episodes" placeholder={anime.episodes || ''} value={progress || ''} onChange={(e) => handleProgress(parseInt(e.target.value))} type="number" min='0' max={anime.episodes || 9999} />
                        </Field>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="text-[#1A202E] font-medium text-sm">Your notes</Label>
                        <Textarea className="border-[#D8DADC] focus-visible:ring-[#FD8D32]/30 focus-visible:border-[#FD8D32] resize-none h-24" placeholder="Type your notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} id="notes" />
                    </div>
                </div>
                <DialogFooter className="mt-2">
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer border-[#DCC1B1] hover:bg-[#F2F4F6] text-[#4A5568]">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAdd}
                            className="cursor-pointer text-white transition-all bg-[#FD8D32] hover:bg-[#e07a28]"
                    >Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        );
    }
    return(
    <Tooltip>
        <TooltipTrigger asChild>
                <Button asChild
                   className={`cursor-pointer text-white transition-all bg-[#FD8D32] hover:bg-[#e07a28] hover:-translate-y-0.5 shadow-sm ${iconOnly ? 'w-10 h-10 p-0 rounded-md flex items-center justify-center' : 'w-full'}`}
                >
                    <Link href="/login">
                        {iconOnly ? <PlusIcon className="w-4 h-4" /> : <><PlusIcon className="w-4 h-4 mr-2" /> Add</>}
                    </Link>
                </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-white border-[#DCC1B1] text-[#1A202E]">
            <p>Login to add to list</p>
        </TooltipContent>
    </Tooltip>
    );
}