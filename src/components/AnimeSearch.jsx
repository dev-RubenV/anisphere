'use client'

import { SearchIcon } from "lucide-react"
import { useState } from "react";
import { useRouter } from "next/navigation";


import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"


export function AnimeSearch() {
    const[animeToSearch, setAnimeToSearch] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        if (animeToSearch !== "") {
            router.push(`/search?q=${animeToSearch}`);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    }

    return (
        <div className="grid max-w-sm gap-6">
            <InputGroup>
                <InputGroupInput onKeyDown={handleKeyDown} onChange={(e) => setAnimeToSearch(e.target.value)} placeholder="Search..." />
                <InputGroupAddon>
                    <SearchIcon className="text-blue-400" />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                    <InputGroupButton className="cursor-pointer" onClick={handleSearch}>Search Anime</InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}