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
        <FieldGroup className="max-w-sm w-full">
            <form onSubmit={handleUsernameSubmit}>
                <Field className={"max-w-sm mb-4"}>
                    <FieldLabel htmlFor="username">
                        <h1 className="scroll-m-20 text-center text-xl font-extrabold">
                            Change your Username:
                        </h1>
                    </FieldLabel>
                    <InputGroup className="h-auto">
                        <InputGroupInput
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </InputGroup>
                    <FieldDescription htmlFor="username">{usernameError}</FieldDescription>
                </Field>
                <Field className="max-w-sm my-4">
                    <FieldLabel htmlFor="username">
                        <p className="text-center text-xl font-extrabold">
                            Password:
                        </p>
                    </FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="block-start-input"
                            type={passwordVisibility ? "text" : "password"}
                            placeholder={user?.provider === "google" ? "Not required for Google accounts" : "Enter your current password"}
                            disabled={user?.provider === "google"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}/>
                        <InputGroupAddon className="cursor-pointer"
                                         onClick={() => setPasswordVisibility(!passwordVisibility)} align="inline-end">
                            {passwordVisibility ? <EyeOffIcon/> : <EyeIcon/>}
                        </InputGroupAddon>
                    </InputGroup>
                </Field>

                    <Button className="cursor-pointer" type="submit" variant="outline">Change username</Button>
            </form>
        </FieldGroup>)
}
