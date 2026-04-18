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
        <FieldGroup className="max-w-sm w-full">
            <form onSubmit={handleSubmit}>

            {user.provider !== "google" && (
                <Field className="max-w-sm mb-4">
                    <FieldLabel htmlFor="currentPassword">
                        <p className="text-center text-xl font-extrabold">
                            Insert your current password:
                        </p>
                    </FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="currentPassword"
                            type={passwordVisibility ? "text" : "password"}
                            placeholder="Enter your current password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}/>
                        <InputGroupAddon className="cursor-pointer"
                                         onClick={() => setPasswordVisibility(!passwordVisibility)} align="inline-end">
                            {passwordVisibility ? <EyeOffIcon/> : <EyeIcon/>}
                        </InputGroupAddon>
                    </InputGroup>
                    <div className="text-sm text-red-500 mt-2">
                        {passwordError}
                    </div>
                </Field>
            )}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="cursor-pointer bg-red-700 hover:bg-red-800 text-white" type="button" variant="default">
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                                These changes are permanent. Are you sure you want to proceed?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button className="cursor-pointer" variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button className="cursor-pointer bg-red-700 hover:bg-red-800 text-white" onClick={handleSubmit} type="button" variant="default">
                                Proceed
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </FieldGroup>
    )
}