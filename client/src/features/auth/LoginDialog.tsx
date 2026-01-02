import { CloseOutlined } from "@mui/icons-material";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import LoginForm from "./LoginForm";

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    onSwitchToSignup?: () => void;
}

export default function LoginDialog({ open, onClose, onSwitchToSignup }: DialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: "0.5rem",
                }}
            >
                Sign in
                <IconButton
                    edge="end"
                    size="small"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    pt: 0,
                    pb: "1.5rem",
                }}
            >
                <LoginForm onSuccess={onClose} onSwitchToSignUp={onSwitchToSignup} />
            </DialogContent>
        </Dialog>
    );
}
