import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function MovieCardSkeleton() {
    return (
        <>
            <Card
                sx={{
                    maxWidth: '16rem',
                    borderRadius: '1.2rem',
                    boxShadow: 4,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                }}
            >
                <Skeleton variant="rectangular" sx={{width: '100%', height: '12rem'}}></Skeleton>
                <CardContent>
                    <Skeleton variant="text" sx={{fontSize: '1rem', mb: '0.25rem'}}></Skeleton>
                    <Skeleton variant='text' sx={{fontSize: '0.875rem', width: '60%'}}></Skeleton>
                </CardContent>
            </Card>
        </>
    );
}