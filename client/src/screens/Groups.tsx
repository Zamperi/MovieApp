import { useEffect, useMemo, useState } from "react";
import { Box, Container, Typography, Collapse } from "@mui/material";
import { motion } from "framer-motion";
import FilterCard from "../components/FilterCard";
import GroupCard from "../components/GroupCard";
import CreateGroupCard from "../components/CreateGroupCard";
import { getGroups, type GroupListItemDTO } from "../services/dbService";
import { useUser } from "../context/useUser";

type GroupSort = "name_asc" | "name_desc" | "created_newest" | "created_oldest";

function sortGroups(items: GroupListItemDTO[], sort: GroupSort): GroupListItemDTO[] {
    const copy = [...items];

    const byNameAsc = (a: GroupListItemDTO, b: GroupListItemDTO) =>
        (a.name ?? "").localeCompare(b.name ?? "", "en", { sensitivity: "base" });

    const byCreated = (a: GroupListItemDTO, b: GroupListItemDTO) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
    };

    if (sort === "name_asc") return copy.sort(byNameAsc);
    if (sort === "name_desc") return copy.sort((a, b) => byNameAsc(b, a));
    if (sort === "created_oldest") return copy.sort(byCreated);
    if (sort === "created_newest") return copy.sort((a, b) => byCreated(b, a));
    return copy;
}

export default function Groups() {
    const [results, setResults] = useState<GroupListItemDTO[]>([]);
    const [groupSort, setGroupSort] = useState<GroupSort>("name_asc");
    const [loading, setLoading] = useState<boolean>(true);

    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
    const { user } = useUser();

    useEffect(() => {
        setFiltersOpen(true);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            const data = await getGroups();
            if (cancelled) return;
            setResults(data);
            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const visibleGroups = useMemo(() => {
        return sortGroups(results, groupSort);
    }, [results, groupSort]);

    const handleGroupCreated = (group: GroupListItemDTO) => {
        setResults((prev) => [...prev, group]);
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
                overflowX: "hidden",
            }}
        >
            <Container
                maxWidth="lg"
                disableGutters
                sx={{
                    px: { xs: 1.5, sm: 2, md: 3 },
                    boxSizing: "border-box",
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{ mb: { xs: "1rem", md: "1.5rem" } }}
                >
                    Groups
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: "flex-start",
                        gap: { xs: "1.5rem", md: "2rem" },
                        width: "100%",
                    }}
                >
                    {/* Filters (left) */}
                    <Box sx={{ flexShrink: 0, width: { xs: "100%", md: "17rem" } }}>
                        <Collapse in={filtersOpen} orientation="vertical" timeout={500}>
                            <FilterCard
                                page="groups"
                                sortValue={groupSort}
                                onSortChange={(value) => setGroupSort(value as GroupSort)}
                            />
                        </Collapse>
                    </Box>

                    {/* Results (grid) */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {user && (
                            <Box sx={{ mb: { xs: "1.25rem", md: "1.5rem" } }}>
                                <CreateGroupCard onCreated={handleGroupCreated} />
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "grid",
                                width: "100%",
                                gridTemplateColumns: {
                                    xs: "repeat(1, minmax(0, 1fr))",
                                    sm: "repeat(2, minmax(0, 1fr))",
                                    md: "repeat(3, minmax(0, 1fr))",
                                    lg: "repeat(3, minmax(0, 1fr))",
                                },
                                gap: (theme) =>
                                    ({
                                        xs: theme.spacing(2),
                                        sm: theme.spacing(2.5),
                                        md: theme.spacing(3),
                                    }) as any,
                            }}
                        >
                            {(loading ? Array.from({ length: 9 }) : visibleGroups).map(
                                (g: any, index: number) => {
                                    const isLoaded = !loading;

                                    return (
                                        <Box
                                            key={isLoaded ? g.id : `skeleton-${index}`}
                                            sx={{ width: "100%", maxWidth: "100%" }}
                                        >
                                            <motion.div
                                                style={{ width: "100%" }}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.02 }}
                                            >
                                                {isLoaded ? (
                                                    <GroupCard
                                                        id={g.id}
                                                        name={g.name}
                                                        createdAt={g.createdAt ?? null}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            width: "100%",
                                                            borderRadius: "1.2rem",
                                                            boxShadow: 2,
                                                            bgcolor: "rgba(0,0,0,0.04)",
                                                            height: { xs: "7rem", sm: "7.25rem" },
                                                        }}
                                                    />
                                                )}
                                            </motion.div>
                                        </Box>
                                    );
                                }
                            )}
                        </Box>

                        {!loading && visibleGroups.length === 0 && (
                            <Typography variant="body2" sx={{ mt: "1rem", opacity: 0.7 }}>
                                No groups found.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
