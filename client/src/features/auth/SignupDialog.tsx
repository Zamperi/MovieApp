import { CloseOutlined } from "@mui/icons-material";
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import SignupForm from './SignupForm';

interface DialogProps {
    open: boolean,
    onClose: () => void,
    onSwitchToLogin?: () => void,
}

export default function SignupDialog({ open, onClose, onSwitchToLogin }: DialogProps) {
    return(
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: "0.5rem",
                }}
            >
                Sign up
                <IconButton
                    edge="end"
                    size="small"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <SignupForm onSuccess={onClose} onSwitchToSignIn={onSwitchToLogin} />
            </DialogContent>
        </Dialog>
    );
}