"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { AnimeSearch } from "@/components/AnimeSearch";
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function NavMenu() {

    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        await router.push("/login");
    }

    return (
        <header className="glass sticky top-4 z-50 mx-auto w-[95%] max-w-6xl rounded-3xl border border-[#DCC1B1]/30 shadow-sm">
            <div className="container flex items-center justify-between gap-4 py-3 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Logo / Marca */}
                <div className="flex items-center shrink-0">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="cursor-pointer gap-2 font-semibold text-[#1A202E] hover:text-[#FD8D32] hover:bg-[#FD8D32]/5 transition-colors"
                        >
                            <Image className="w-5 h-5 text-[#FD8D32]"
                            src="/anisphere-logo.png"
                            alt="anisphere-logo"
                            width="56"
                            height="56"/>
                            <span className="text-lg font-bold">anisphere</span>
                        </Button>
                    </Link>
                </div>

                {/* Barra de pesquisa — escondida em mobile, visível em desktop */}
                <div className="hidden md:flex flex-1 max-w-md mx-auto">
                    <AnimeSearch />
                </div>

                {/* Área de utilizador no desktop */}
                <div className="hidden md:flex items-center justify-end gap-3">
                    {!user ? (
                        <Button
                            asChild
                            className="bg-[#FD8D32] hover:bg-[#e07a28] text-white rounded-lg px-5 cursor-pointer transition-all hover:-translate-y-0.5"
                        >
                            <Link href="/login">Login</Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-[#4A5568]">
                                Hello, <span className="font-semibold text-[#1A202E]">{user?.displayName ? `${user.displayName}` : "User"}</span>
                            </p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer hover:ring-2 hover:ring-[#FD8D32]/40 transition-all w-9 h-9">
                                        <AvatarImage
                                            src={user?.photoURL}
                                            alt="user"
                                            referrerPolicy="no-referrer"
                                        />
                                        <AvatarFallback className="bg-[#FD8D32]/10 text-[#954A00] font-semibold text-sm">
                                            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-52 bg-white border-[#DCC1B1]/30 shadow-lg rounded-xl" align="end">
                                    <DropdownMenuLabel className="text-[#1A202E] font-semibold">My Account</DropdownMenuLabel>
                                    <DropdownMenuGroup>
                                        <Link href={"/profile"}><DropdownMenuItem className="cursor-pointer text-[#4A5568] hover:text-[#FD8D32] hover:bg-[#FD8D32]/5">Profile</DropdownMenuItem></Link>
                                        <Link href={"/settings"}><DropdownMenuItem className="cursor-pointer text-[#4A5568] hover:text-[#FD8D32] hover:bg-[#FD8D32]/5">Settings</DropdownMenuItem></Link>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-[#E6E8EA]" />
                                    <DropdownMenuItem className="cursor-pointer text-[#BA1A1A] hover:bg-red-50" onClick={handleLogout}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Botão do menu mobile */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-[#EDF2F7] transition-colors text-[#1A202E]"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Menu dropdown mobile */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-[#E6E8EA] bg-white/95 backdrop-blur-md px-4 pb-4 pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200 rounded-xl">
                    {/* Pesquisa mobile */}
                    <div className="w-full">
                        <AnimeSearch />
                    </div>

                    {!user ? (
                        <Button
                            asChild
                            className="w-full bg-[#FD8D32] hover:bg-[#e07a28] text-white rounded-lg cursor-pointer"
                        >
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={user?.photoURL} alt="user" referrerPolicy="no-referrer" />
                                    <AvatarFallback className="bg-[#FD8D32]/10 text-[#954A00] font-semibold text-xs">
                                        {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-[#1A202E] text-sm">{user?.displayName || "User"}</span>
                            </div>
                            <Link
                                href="/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm text-[#4A5568] hover:bg-[#EDF2F7] transition-colors"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm text-[#4A5568] hover:bg-[#EDF2F7] transition-colors"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                className="cursor-pointer w-full text-left px-3 py-2 rounded-lg text-sm text-[#BA1A1A] hover:bg-red-50 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}