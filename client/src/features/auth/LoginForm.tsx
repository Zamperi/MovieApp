import { useState, type FormEvent } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useUser } from "../../context/useUser";
import { useToast } from "../../context/useToast";

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToSignUp?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
    const { login, user } = useUser();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            await login(email, password, rememberMe);

            onSuccess?.();

            setTimeout(() => {
                const name = user?.firstname || "there";
                showToast(`Welcome back ${name}`, "success");
            }, 0);
        } catch {
            setErrorMsg("Invalid email or password");
            showToast("Login failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            {errorMsg && (
                <Typography
                    variant="body2"
                    color="error"
                    sx={{ mb: "0.25rem" }}
                >
                    {errorMsg}
                </Typography>
            )}

            <TextField
                label="Email"
                type="email"
                name="email"
                fullWidth
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
                label="Password"
                type="password"
                name="password"
                fullWidth
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                }
                label="Remember me"
            />

            <Button
                type="submit"
                variant="contained"
                disabled={loading}
            >
                {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Button
                variant="text"
                onClick={onSwitchToSignUp}
                disabled={loading}
            >
                Create an account
            </Button>
        </Box>
    );
}
