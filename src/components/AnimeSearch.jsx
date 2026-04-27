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
        <div className="w-full">
            <InputGroup className="bg-white border border-[#D8DADC] rounded-lg overflow-hidden focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all">
                <InputGroupInput
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setAnimeToSearch(e.target.value)}
                    placeholder="Search anime or users..."
                    className="border-none focus:ring-0 text-[#1A202E] placeholder:text-[#4A5568]/50 text-sm"
                />
                <InputGroupAddon>
                    <SearchIcon className="text-[#FD8D32] w-4 h-4" />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        className="cursor-pointer bg-[#FD8D32] hover:bg-[#e07a28] text-white text-xs font-semibold px-3 rounded-md transition-colors"
                        onClick={handleSearch}
                    >
                        Search
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
        </div>
    )
}