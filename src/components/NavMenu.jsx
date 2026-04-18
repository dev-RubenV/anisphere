"use client"

import * as React from "react"
import Link from "next/link"
import { House, BookOpen, NotebookPen} from "lucide-react"
import { AnimeSearch } from "@/components/AnimeSearch";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styles from "@/app/login/Login.module.css";
import Image from "next/image";
export function NavMenu() {

    // Auth do user
    const { user, loading, logout } = useAuth();

    // Navegação next.js
    const router = useRouter();

    const handleLogout = async ()=> {
        await logout();
        await router.push("/login");
    }

    return (
        <header className="container w-full py-4 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center">
                <Link href="/">
                    <Button variant="ghost" className="cursor-pointer gap-2 font-semibold">
                        <NotebookPen className="w-4 h-4" />
                        Anime list
                    </Button>
                </Link>
            </div>

            <div className="flex-1 max-w-md mx-auto">
                <AnimeSearch />
            </div>

            <div className="flex items-center justify-end">
                {!user ? (
                    <Button variant="secondary" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                ) : (
                    <div className="flex items-center">
                        <p className="px-6">Hello, <span className="font-bold">{user?.displayName ? `${user.displayName}` : "User"}</span>!</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                    <AvatarImage
                                        src={user?.photoURL}
                                        alt="user"
                                        referrerPolicy="no-referrer"
                                    />
                                    <AvatarFallback>
                                        {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                    <Link href={"/profile"}><DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem></Link>
                                    <Link href={"/settings"}><DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem></Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </header>
    )
}