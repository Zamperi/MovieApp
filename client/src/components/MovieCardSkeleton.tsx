import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function MovieCardSkeleton() {
    return (
        <Card
            sx={{
                width: '100%',              // täyttää 180px wrapperin
                borderRadius: '1.2rem',
                boxShadow: 4,
                overflow: 'hidden',
                backgroundColor: 'background.paper',
            }}
        >
            {/* Kuvan skeleton samalla aspectRatio-suhteella kuin MovieCardissa */}
            <Box sx={{ width: '100%', aspectRatio: '2/3' }}>
                <Skeleton
                    variant="rectangular"
                    sx={{ width: '100%', height: '100%' }}
                />
            </Box>

            <CardContent
                sx={{
                    padding: '0.75rem 0.9rem 0.9rem', // sama kuin MovieCardissa
                }}
            >
                {/* Vain yksi tekstirivi, kuten MovieCardissa */}
                <Skeleton
                    variant="text"
                    sx={{
                        fontSize: '0.95rem',
                        lineHeight: 1.3,
                    }}
                />
            </CardContent>
        </Card>
    );
}
