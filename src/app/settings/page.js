'use client'
import * as React from "react"
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import ChangeUsername from "@/components/settings/ChangeUsername";
import ChangePassword from "@/components/settings/ChangePassword";
import {Separator} from "@/components/ui/separator";
import DeleteAccount from "@/components/settings/DeleteAccount";

export default function Settings() {

    const {user, loading: authLoading} = useAuth();


    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="flex items-center justify-center py-20 w-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#FD8D32]/30 border-t-[#FD8D32] rounded-full animate-spin"></div>
                    <p className="text-[#4A5568] text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full mt-10 pb-20">
            <div className="aura-card p-6 md:p-10 w-full max-w-2xl space-y-10">
                <div className="text-center mb-8">
                    <h1 className="headline-lg text-[#1A202E]">Account Settings</h1>
                    <p className="text-[#4A5568] text-sm mt-2">Manage your account preferences and security.</p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E6E8EA] rounded-xl p-6">
                    <ChangeUsername/>
                </div>

                {user.provider !== "google" && (
                    <div className="bg-[#F8FAFC] border border-[#E6E8EA] rounded-xl p-6">
                        <ChangePassword/>
                    </div>
                )}

                <Separator className="bg-[#E6E8EA] w-full" />

                <div className="bg-[#BA1A1A]/5 border border-[#BA1A1A]/20 rounded-xl p-6">
                    <DeleteAccount/>
                </div>
            </div>
        </div>
    )
}