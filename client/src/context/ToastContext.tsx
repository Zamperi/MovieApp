import { createContext, useState, type ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type ToastContextType = {
    showToast: (message: string, severity?: ToastSeverity) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [severity, setSeverity] = useState<ToastSeverity>("info");

    const showToast: ToastContextType["showToast"] = (
        msg,
        sev = "info"
    ) => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity={severity} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}
