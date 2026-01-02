import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    Chip,
    Container,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelIcon from "@mui/icons-material/Cancel";
import { useUser } from "../context/useUser";
import { useToast } from "../context/useToast";
import {
    getGroup,
    getJoinRequest,
    sendJoinRequest,
    type GroupDetailDTO,
    type JoinRequestDTO,
} from "../services/dbService";

function StatusChip({ status }: { status: JoinRequestDTO["status"] }) {
    const color = status === "approved" ? "success" : status === "rejected" ? "error" : "warning";
    const icon =
        status === "approved" ? <CheckCircleIcon /> : status === "rejected" ? <CancelIcon /> : <HourglassBottomIcon />;

    return <Chip color={color} icon={icon} label={status.charAt(0).toUpperCase() + status.slice(1)} />;
}

export default function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const groupId = Number(id);
    const { user } = useUser();
    const { showToast } = useToast();

    const [group, setGroup] = useState<GroupDetailDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [joinRequest, setJoinRequest] = useState<JoinRequestDTO | null>(null);
    const [joining, setJoining] = useState<boolean>(false);

    useEffect(() => {
        if (!Number.isInteger(groupId)) return;

        let cancelled = false;
        async function fetchGroup() {
            setLoading(true);
            const data = await getGroup(groupId);
            if (!cancelled) {
                setGroup(data);
                setLoading(false);
            }
        }

        fetchGroup();

        return () => {
            cancelled = true;
        };
    }, [groupId]);

    useEffect(() => {
        if (!user || !Number.isInteger(groupId)) return;

        let cancelled = false;
        async function fetchStatus() {
            const status = await getJoinRequest(groupId);
            if (!cancelled) setJoinRequest(status);
        }

        fetchStatus();

        return () => {
            cancelled = true;
        };
    }, [groupId, user]);

    const createdLabel = useMemo(() => {
        if (!group?.createdAt) return null;
        const d = new Date(group.createdAt);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString();
    }, [group?.createdAt]);

    const isMember = useMemo(() => {
        if (!user || !group) return false;
        return group.members.some((m) => m.id === user.id);
    }, [group, user]);

    const canRequestJoin = useMemo(() => {
        if (!user || !group) return false;
        if (isMember) return false;
        return !joinRequest;
    }, [group, isMember, joinRequest, user]);

    const handleJoinRequest = async () => {
        if (!user) {
            showToast("Please sign in to send a join request", "info");
            navigate("/signin");
            return;
        }

        try {
            setJoining(true);
            const result = await sendJoinRequest(groupId);
            setJoinRequest(result);
            showToast("Join request sent", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to send join request", "error");
        } finally {
            setJoining(false);
        }
    };

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                py: { xs: "1.25rem", md: "2.5rem" },
                mb: { xs: "0.75rem", md: "1.5rem" },
                mt: { xs: "0.5rem", md: "1.5rem" },
                borderRadius: { xs: 0, md: "0.75rem" },
                boxShadow: { xs: "none", md: 3 },
            }}
        >
            <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", md: "center" }}>
                    <Box
                        sx={{
                            width: "3.5rem",
                            height: "3.5rem",
                            borderRadius: "1rem",
                            bgcolor: "rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <GroupsIcon sx={{ fontSize: "2rem" }} />
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                            {loading ? "Loading group..." : group?.name ?? "Group not found"}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75, flexWrap: "wrap" }}>
                            {createdLabel && (
                                <Chip size="small" label={`Created ${createdLabel}`} sx={{ mr: 0.5 }} />
                            )}
                            {group && (
                                <Chip
                                    size="small"
                                    icon={<PersonIcon />}
                                    label={`Owner: ${group.owner.username}`}
                                    sx={{ mr: 0.5 }}
                                />
                            )}
                            {group?.isPublic ? (
                                <Chip size="small" color="success" label="Public" />
                            ) : (
                                <Chip size="small" color="default" label="Private" />
                            )}
                        </Stack>
                    </Box>
                </Stack>

                <Divider sx={{ my: { xs: 2, md: 3 } }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }}>
                    <Card
                        sx={{
                            flex: 2,
                            p: { xs: 2, md: 3 },
                            borderRadius: "1rem",
                            boxShadow: 3,
                            minHeight: "10rem",
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }}>Members</Typography>
                        {loading && <Typography variant="body2">Loading members...</Typography>}
                        {!loading && group && group.members.length === 0 && (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                No members yet.
                            </Typography>
                        )}
                        {!loading && group && group.members.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {group.members.map((member) => (
                                    <Chip key={member.id} label={member.username} icon={<PersonIcon />} />
                                ))}
                            </Stack>
                        )}
                    </Card>

                    <Card
                        sx={{
                            flex: 1,
                            p: { xs: 2, md: 3 },
                            borderRadius: "1rem",
                            boxShadow: 3,
                            minWidth: { md: "16rem" },
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Join this group
                        </Typography>

                        {!user && (
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                                Sign in to request membership and follow group activity.
                            </Typography>
                        )}

                        {isMember && (
                            <Chip color="success" icon={<CheckCircleIcon />} label="You are a member" sx={{ mb: 1 }} />
                        )}

                        {joinRequest && !isMember && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.75 }}>
                                    Your join request status
                                </Typography>
                                <StatusChip status={joinRequest.status} />
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!canRequestJoin || joining}
                            onClick={handleJoinRequest}
                            fullWidth
                        >
                            {joining ? "Sending request..." : isMember ? "Already a member" : joinRequest ? "Request sent" : "Send join request"}
                        </Button>
                    </Card>
                </Stack>
            </Container>
        </Box>
    );
}
