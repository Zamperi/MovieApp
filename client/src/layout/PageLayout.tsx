import { Container, Box } from "@mui/material";

interface PageLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean; 
}

export default function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  if (fullWidth) {
    return (
      <Box sx={{ width: "100%", overflowX: "hidden" }}>
        {children}
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {children}
    </Container>
  );
}
