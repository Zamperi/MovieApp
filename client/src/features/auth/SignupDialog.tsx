import { Dialog, DialogTitle } from '@mui/material';
import SignupForm from './SignupForm';

interface DialogProps {
    open: boolean,
    onClose: () => void
}

export default function SignupDialog({ open, onClose }: DialogProps) {
    return(
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
            <DialogTitle>Sign up</DialogTitle>
            <SignupForm></SignupForm>
        </Dialog>
    );
}