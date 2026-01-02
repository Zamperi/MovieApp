import { useState, type FormEvent } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    TextField,
    Typography,
} from "@mui/material";
import { useUser } from "../../context/useUser";
import { useToast } from "../../context/useToast";

interface SignupFormProps {
    onSuccess?: () => void;
    onSwitchToSignIn?: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToSignIn }: SignupFormProps) {
    const { register } = useUser();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        firstname: "",
        lastname: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = field === "rememberMe" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (form.password !== form.confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await register(
                {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    firstname: form.firstname,
                    lastname: form.lastname,
                },
                form.rememberMe,
            );

            showToast("Account created successfully", "success");
            onSuccess?.();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Registration failed";
            setErrorMsg(message);
            showToast(message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: "1rem", pt: 1, pb: "1.5rem" }}
        >
            {errorMsg && (
                <Typography variant="body2" color="error" sx={{ mb: "0.25rem" }}>
                    {errorMsg}
                </Typography>
            )}

            <TextField
                label="Username"
                name="username"
                required
                fullWidth
                value={form.username}
                onChange={handleChange("username")}
            />

            <TextField
                label="Email"
                type="email"
                name="email"
                required
                fullWidth
                autoComplete="email"
                value={form.email}
                onChange={handleChange("email")}
            />

            <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                    label="First name"
                    name="firstname"
                    required
                    fullWidth
                    value={form.firstname}
                    onChange={handleChange("firstname")}
                />

                <TextField
                    label="Last name"
                    name="lastname"
                    required
                    fullWidth
                    value={form.lastname}
                    onChange={handleChange("lastname")}
                />
            </Box>

            <TextField
                label="Password"
                type="password"
                name="password"
                required
                fullWidth
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange("password")}
            />

            <TextField
                label="Confirm password"
                type="password"
                name="confirmPassword"
                required
                fullWidth
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={form.rememberMe}
                        onChange={handleChange("rememberMe")}
                    />
                }
                label="Keep me signed in"
            />

            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
            </Button>

            <Button variant="text" onClick={onSwitchToSignIn} disabled={loading}>
                Already have an account? Sign in
            </Button>
        </Box>
    );
}
