import Container from "@mui/material/Container";
import ProjectTable from "./ProjectTable";
import Typography from "@mui/material/Typography";

export default function HomePage() {
  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, backgroundColor: "white", padding: "20px" }}
    >
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <ProjectTable />
    </Container>
  );
}
