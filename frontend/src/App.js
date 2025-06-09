import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomePage from "./components/Home";
import NavBar from "./components/NavBar";
import Import from "./components/Import";
import Project from "./components/Project";
import ResultQuery from "./components/ResultQuery";
import { CsrfProvider } from "./CsrfProvider";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CsrfProvider>
        <Router>
          <NavBar />
          <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/import" element={<Import />} />
                <Route path="/project/:projectId" element={<Project />} />
                <Route path="/query" element={<ResultQuery/>} />
                <Route
                  path="*"
                  element={
                    <Typography variant="h4" align="center" sx={{ mt: 8 }}>
                      404 - Page Not Found
                    </Typography>
                  }
                />
              </Routes>
            </Container>
          </Box>
        </Router>
      </CsrfProvider>
    </ThemeProvider>
  );
}

export default App;