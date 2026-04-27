import * as React from "react";
import {useEffect, useState} from "react";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import {EyeOffIcon, EyeIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {updateProfile as updateFirebaseProfile} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {useAuth} from "@/context/AuthContext";



export default function ChangeUsername() {

    const {user, updateProfile} = useAuth();

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.displayName){
            setUsername(user.displayName);
        }
    }, [user]);

    useEffect(() => {

        if(!username){
            setUsernameError("");
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9]{3,16}$/
        if(!username.match(usernameRegex)){
            setUsernameError("Username must consist of 3 up to 16 characters, no spaces or special characters allowed!");
        } else {
            setUsernameError("");
        }

    }, [username]);

    const handleUsernameSubmit = async(e) => {
        e.preventDefault();
        setUsernameError("");
        setIsSubmitting(true);

        try{
            const usernameRegex = /^[a-zA-Z0-9]{3,16}$/

            if(!username || !username.match(usernameRegex)){
                setUsernameError("Username must consist of 3 up to 16 characters, no spaces or special characters allowed!");
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`/api/users/update-username/`, {
                headers: {"Content-Type": "application/json"},
                method: "POST",
                body: JSON.stringify({
                    newUsername: username,
                    email: user.email,
                    password: password
                }),
            })

            const data = await response.json();

            if(!response.ok){
                setUsernameError(data.error);
                setIsSubmitting(false);
                return;
            }

            if(user.provider === "google" && auth.currentUser){
                await updateFirebaseProfile(auth.currentUser,
                    {displayName: username});
            }

            updateProfile({displayName: username});

            setUsernameError("Username has been changed successfully.");
            setPassword("");

        }catch(error){
            setUsernameError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!user) {
        return null;
    }

    return (
        <FieldGroup className="w-full">
            <form onSubmit={handleUsernameSubmit} className="space-y-5">
                <div className="mb-4">
                    <h2 className="headline-md text-[#1A202E] mb-1">Change Username</h2>
                    <p className="text-[#4A5568] text-sm">Choose a unique name to represent you.</p>
                </div>
                
                <Field className="w-full">
                    <FieldLabel htmlFor="username" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                        New Username
                    </FieldLabel>
                    <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all w-full">
                        <InputGroupInput
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="border-none focus:ring-0 text-[#1A202E] py-2.5 px-3 w-full"
                        />
                    </InputGroup>
                    {usernameError && (
                        <p className={`text-sm mt-1.5 font-medium ${usernameError.includes('successfully') ? 'text-[#954A00]' : 'text-[#BA1A1A]'}`}>
                            {usernameError}
                        </p>
                    )}
                </Field>

                <Field className="w-full">
                    <FieldLabel htmlFor="current-password" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                        Password confirmation
                    </FieldLabel>
                    <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all w-full">
                        <InputGroupInput
                            id="current-password"
                            type={passwordVisibility ? "text" : "password"}
                            placeholder={user?.provider === "google" ? "Not required for Google accounts" : "Enter your current password"}
                            disabled={user?.provider === "google"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="border-none focus:ring-0 text-[#1A202E] py-2.5 px-3 placeholder:text-[#A0ABC1] w-full"
                        />
                        <InputGroupAddon className="cursor-pointer text-[#4A5568] hover:text-[#FD8D32] transition-colors pr-3"
                                         onClick={() => setPasswordVisibility(!passwordVisibility)} align="inline-end">
                            {passwordVisibility ? <EyeOffIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                        </InputGroupAddon>
                    </InputGroup>
                </Field>

                <Button 
                    className="cursor-pointer bg-[#FD8D32] hover:bg-[#e07a28] text-white font-medium rounded-lg px-6 py-2.5 w-full sm:w-auto mt-2 transition-all hover:-translate-y-0.5" 
                    type="submit" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Change Username"}
                </Button>
            </form>
        </FieldGroup>)
}
