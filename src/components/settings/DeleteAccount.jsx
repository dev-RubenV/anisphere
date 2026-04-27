'use client' // Obrigatório quando usamos useRouter no App Router
import * as React from "react";
import {useEffect, useState} from "react";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {EyeOffIcon, EyeIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";

import { useRouter } from "next/navigation";

export default function DeleteAccount() {

    const {user, logout} = useAuth();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [passwordVisibility, setPasswordVisibility] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async(e) => {
        e?.preventDefault();
        setPasswordError("");
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/users/delete-account`, {
                headers: {"Content-Type": "application/json"},
                method: "DELETE",
                body: JSON.stringify({
                    userId: user._id || user.id,
                    password: password,
                }),
            });

            const data = await response.json();

            if(!response.ok) {
                setPasswordError(data.error);
                setIsSubmitting(false);
                return;
            }

            setPassword("");

            if(logout) await logout();

        } catch (error) {
            setPasswordError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!user) return null;

    return(
        <FieldGroup className="w-full">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="mb-4">
                    <h2 className="headline-md text-[#BA1A1A] mb-1">Danger Zone</h2>
                    <p className="text-[#4A5568] text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                </div>

            {user.provider !== "google" && (
                <Field className="w-full">
                    <FieldLabel htmlFor="currentPasswordDelete" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                        Confirm your password to delete
                    </FieldLabel>
                    <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#BA1A1A] focus-within:ring-2 focus-within:ring-[#BA1A1A]/15 transition-all w-full">
                        <InputGroupInput
                            id="currentPasswordDelete"
                            type={passwordVisibility ? "text" : "password"}
                            placeholder="Enter your current password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="border-none focus:ring-0 text-[#1A202E] py-2.5 px-3 placeholder:text-[#A0ABC1] w-full"
                        />
                        <InputGroupAddon className="cursor-pointer text-[#4A5568] hover:text-[#BA1A1A] transition-colors pr-3"
                                         onClick={() => setPasswordVisibility(!passwordVisibility)} align="inline-end">
                            {passwordVisibility ? <EyeOffIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                        </InputGroupAddon>
                    </InputGroup>
                    {passwordError && (
                        <div className="text-sm font-medium text-[#BA1A1A] mt-1.5">
                            {passwordError}
                        </div>
                    )}
                </Field>
            )}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="cursor-pointer bg-[#BA1A1A] hover:bg-[#93000A] text-white font-medium rounded-lg px-6 py-2.5 w-full sm:w-auto mt-2 transition-all hover:-translate-y-0.5" type="button" variant="default">
                            Delete Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm bg-white border-[#DCC1B1]/30 shadow-xl rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-[#1A202E] font-bold">Are you absolutely sure?</DialogTitle>
                            <DialogDescription className="text-[#4A5568]">
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button className="cursor-pointer border-[#DCC1B1] text-[#4A5568] hover:bg-[#F2F4F6]" variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button className="cursor-pointer bg-[#BA1A1A] hover:bg-[#93000A] text-white" onClick={handleSubmit} type="button" variant="default">
                                Proceed with Deletion
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </FieldGroup>
    )
}