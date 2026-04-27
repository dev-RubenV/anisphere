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
    const PASSWORD_ERROR_MESSAGE = <ul className="list-disc pl-5 text-sm text-[#BA1A1A]">
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
            <FieldGroup className="w-full">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="mb-4">
                        <h2 className="headline-md text-[#1A202E] mb-1">Change Password</h2>
                        <p className="text-[#4A5568] text-sm">Update your password to keep your account secure.</p>
                    </div>

                    <Field className="w-full">
                        <FieldLabel htmlFor="currentPassword" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                            Current Password
                        </FieldLabel>
                        <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all w-full">
                            <InputGroupInput
                                id="currentPassword"
                                type={passwordVisibility ? "text" : "password"}
                                placeholder="Enter your current password"
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

                    <Field className="w-full">
                        <FieldLabel htmlFor="newPassword" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                            New Password
                        </FieldLabel>
                        <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all w-full">
                            <InputGroupInput
                                id="newPassword"
                                type={newPasswordVisibility ? "text" : "password"}
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="border-none focus:ring-0 text-[#1A202E] py-2.5 px-3 placeholder:text-[#A0ABC1] w-full"
                            />
                            <InputGroupAddon className="cursor-pointer text-[#4A5568] hover:text-[#FD8D32] transition-colors pr-3"
                                             onClick={() => setNewPasswordVisibility(!newPasswordVisibility)} align="inline-end">
                                {newPasswordVisibility ? <EyeOffIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                            </InputGroupAddon>
                        </InputGroup>
                        {newPasswordError && (
                            <div className={`text-sm mt-2 font-medium ${typeof newPasswordError === 'string' && newPasswordError.includes('successfully') ? 'text-[#954A00]' : 'text-[#BA1A1A]'}`}>
                                {newPasswordError}
                            </div>
                        )}
                    </Field>

                    <Field className="w-full">
                        <FieldLabel htmlFor="confirmNewPassword" className="text-[#1A202E] font-semibold text-sm mb-1.5 block">
                            Confirm New Password
                        </FieldLabel>
                        <InputGroup className="bg-white border-[#D8DADC] rounded-lg focus-within:border-[#FD8D32] focus-within:ring-2 focus-within:ring-[#FD8D32]/15 transition-all w-full">
                            <InputGroupInput
                                id="confirmNewPassword"
                                type={confirmNewPasswordVisibility ? "text" : "password"}
                                placeholder="Confirm your new password"
                                value={confirmNewPassword}
                                onChange={e => setConfirmNewPassword(e.target.value)}
                                className="border-none focus:ring-0 text-[#1A202E] py-2.5 px-3 placeholder:text-[#A0ABC1] w-full"
                            />
                            <InputGroupAddon className="cursor-pointer text-[#4A5568] hover:text-[#FD8D32] transition-colors pr-3"
                                             onClick={() => setConfirmNewPasswordVisibility(!confirmNewPasswordVisibility)} align="inline-end">
                                {confirmNewPasswordVisibility ? <EyeOffIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                            </InputGroupAddon>
                        </InputGroup>
                        {confirmNewPasswordError && (
                            <FieldDescription htmlFor="confirmNewPassword" className="text-[#BA1A1A] mt-1.5 font-medium">
                                {confirmNewPasswordError}
                            </FieldDescription>
                        )}
                    </Field>

                    <Button 
                        className="cursor-pointer bg-[#FD8D32] hover:bg-[#e07a28] text-white font-medium rounded-lg px-6 py-2.5 w-full sm:w-auto mt-2 transition-all hover:-translate-y-0.5" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Change Password"}
                    </Button>
                </form>
            </FieldGroup>)

}