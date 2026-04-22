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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
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

export function AddToWatchlistButton({ anime, userData}) {
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

                toast(isAdded ? `${anime.title_english} has been updated successfully` : `${anime.title_english} has been added to your list successfully`);
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
                toast(anime.title_english, {
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
                            className="cursor-pointer w-full text-white transition-all bg-blue-400 hover:bg-blue-500"
                        >
                            {isAdded ? <PencilIcon/> : <PlusIcon/>}
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isAdded ? "Edit" : "Add to list"}</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-[425px]">

                <DialogHeader>
                    <DialogTitle>{isAdded ? "Edit" : "Add"} anime to list</DialogTitle>

                    <DialogDescription>
                        Make changes to your list here. Click save when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid grid-cols-6 gap-4">
                        <Field className="col-span-2">
                            <FieldLabel htmlFor="score">Score <span className="gap-6">{score} / 10</span></FieldLabel>
                            <Input id="score" placeholder=' ' value={score} inputMode="decimal" onChange={(e) => handleScores(e.target.value)} step="0.5" type="text" />
                        </Field>
                        <Field className={`flex ${isAdded ? 'col-span-3':'col-span-4'} items-end`}>
                            <FieldLabel htmlFor="favorite"> &nbsp;  </FieldLabel>
                            <Toggle
                                onPressedChange={setIsFavorite}
                                pressed={isFavorite}
                                aria-label="Toggle favorite"
                                size="sm"
                                variant="outline"
                                className="cursor-pointer py-4.25 data-[state=on]:*:[svg]:fill-blue-400 data-[state=on]:*:[svg]:stroke-blue-400"
                            >
                                    <HeartIcon />
                                    {!isFavorite ? "Add to" : "Remove from"} Favorites
                            </Toggle>
                        </Field>
                        { isAdded && (
                        <Field className="flex flex-col items-end">
                            <AlertDialog>
                                <FieldLabel htmlFor="delete"> &nbsp;  </FieldLabel>
                                <AlertDialogTrigger id="delete" asChild>
                                    <Button
                                        className="cursor-pointer text-white bg-red-400 hover:bg-red-500"
                                    >
                                        <Trash size={20} strokeWidth={1.25} />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRemove} className="cursor-pointer">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Field>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select onValueChange={setStatus} defaultValue={status}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Watching" value={status}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Watching">Watching</SelectItem>
                                    <SelectItem value="Plan to watch">Plan to watch</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Dropped">Dropped</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="episodes">Episodes watched <span className="gap-6">{progress} / {anime.episodes}</span></FieldLabel>
                            <Input id="episodes" placeholder={anime.episodes} value={progress || ''} onChange={(e) => handleProgress(parseInt(e.target.value))} type="float" min='0' max={anime.episodes} />
                        </Field>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="notes">Your notes</Label>
                        <Textarea placeholder="Type your notes here." value={notes} onChange={(e) => setNotes(e.target.value)} id="notes" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAdd}
                            className="cursor-pointer text-white transition-all bg-blue-400 hover:bg-blue-500"
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
                   className="cursor-pointer w-full text-white transition-all bg-blue-400 hover:bg-blue-500"
                >
                    <Link href="/login">
                        <PlusIcon />
                    </Link>
                </Button>
        </TooltipTrigger>
        <TooltipContent>
            <p>Add to list</p>
        </TooltipContent>
    </Tooltip>
    );
}