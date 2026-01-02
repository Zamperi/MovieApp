import { useState, type FormEvent } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { createGroup, type GroupListItemDTO } from "../services/dbService";
import { useToast } from "../context/useToast";

type Props = {
    onCreated?: (group: GroupListItemDTO) => void;
};

export default function CreateGroupCard({ onCreated }: Props) {
    const { showToast } = useToast();
    const [groupName, setGroupName] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = groupName.trim();

        if (!trimmedName) {
            setError("Group name is required");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const created = await createGroup({ groupName: trimmedName, isPublic });
            onCreated?.(created);
            setGroupName("");
            setIsPublic(true);
            showToast("Group created successfully", "success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create group";
            setError(message);
            showToast("Could not create group", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card
            component="form"
            onSubmit={handleSubmit}
            sx={{
                borderRadius: "1.2rem",
                boxShadow: 4,
                bgcolor: "background.paper",
            }}
        >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Create a new group
                </Typography>

                <TextField
                    label="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    fullWidth
                />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Allow anyone to request to join
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                inputProps={{ "aria-label": "Public group toggle" }}
                            />
                        }
                        label={isPublic ? "Public" : "Private"}
                        sx={{ m: 0 }}
                    />
                </Box>

                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? "Creating..." : "Create group"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
