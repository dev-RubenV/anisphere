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


    return (
        <div className="flex flex-col items-center justify-center gap-12 mt-10 w-full">
            <ChangeUsername/>

            <Separator className="max-w-sm w-full" />

            <ChangePassword/>

            <Separator className="max-w-sm w-full" />

            <DeleteAccount/>

        </div>
    )
}