import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {EyeIcon, EyeOffIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import * as React from "react";


export default function ChangePassword() {

    const {user} = useAuth();


    const [password, setPassword] = useState("");
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordVisibility, setNewPasswordVisibility] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState("");
    const PASSWORD_ERROR_MESSAGE = <ul className="list-disc pl-5 text-sm text-red-500">
        <li>At least 8 characters</li>
        <li>Must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character</li>
    </ul>;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/

    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [confirmNewPasswordVisibility, setConfirmNewPasswordVisibility] = useState(false);

    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {

        if (!user || user.provider === "google") {
            return;
        }

        if (!newPassword) {
            setNewPasswordError("");
            return;
        }
        if(!newPassword.match(passwordRegex)){
            setNewPasswordError(PASSWORD_ERROR_MESSAGE)
        }else {
            setNewPasswordError("");
        }
    }, [newPassword]);


    const handleSubmit = async(e) => {
        e.preventDefault();
        setNewPasswordError("")
        setConfirmNewPasswordError("")
        setIsSubmitting(true);

        try{
            if(newPassword !== confirmNewPassword) {
                setIsSubmitting(false);
                setConfirmNewPasswordError("New password must match!");
                return;
            }

            if(!newPassword || !newPassword.match(passwordRegex)) {
                setNewPasswordError(PASSWORD_ERROR_MESSAGE);
                setNewPasswordVisibility(false);
                return;
            }

            const response = await fetch(`/api/users/update-password/`, {
                headers: {"Content-Type": "application/json"},
                method: "POST",
                body: JSON.stringify({
                    newPassword: newPassword,
                    email: user.email,
                    password: password
                }),
            });

            const data = await response.json();

            if(!response.ok) {
                setNewPasswordError(data.error);
                setIsSubmitting(false);
                return;
            }

            setNewPasswordError("Password has been updated successfully!")
            setPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch(error) {
            setNewPasswordError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!user || user.provider === "google") {
        return null;
    }

    return (
            <FieldGroup className="max-w-sm w-full">
                <form onSubmit={handleSubmit}>
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

                    </Field>

                    <Field className="max-w-sm my-4">
                        <FieldLabel htmlFor="newPassword">
                            <p className="text-center text-xl font-extrabold">
                                Insert your new password:
                            </p>
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="newPassword"
                                type={newPasswordVisibility ? "text" : "password"}
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}/>
                            <InputGroupAddon className="cursor-pointer"
                                             onClick={() => setNewPasswordVisibility(!newPasswordVisibility)} align="inline-end">
                                {newPasswordVisibility ? <EyeOffIcon/> : <EyeIcon/>}
                            </InputGroupAddon>
                        </InputGroup>
                        <div className="text-sm text-red-500 mt-2">
                            {newPasswordError}
                        </div>
                    </Field>

                    <Field className="max-w-sm my-4">
                        <FieldLabel htmlFor="confirmNewPassword">
                            <p className="text-center text-xl font-extrabold">
                                Confirm your new password:
                            </p>
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="confirmNewPassword"
                                type={confirmNewPasswordVisibility ? "text" : "password"}
                                placeholder="Confirm your new password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}/>
                            <InputGroupAddon className="cursor-pointer"
                                             onClick={() => setConfirmNewPasswordVisibility(!confirmNewPasswordVisibility)} align="inline-end">
                                {confirmNewPasswordVisibility ? <EyeOffIcon/> : <EyeIcon/>}
                            </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription htmlFor="confirmNewPassword">
                            {confirmNewPasswordError}
                        </FieldDescription>
                    </Field>

                    <Button className="cursor-pointer" type="submit" variant="outline">Change password</Button>
                </form>
            </FieldGroup>)

}