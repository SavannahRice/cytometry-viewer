import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import BiotechIcon from "@mui/icons-material/Biotech";
import AddIcon from "@mui/icons-material/Add";
import AppsIcon from "@mui/icons-material/Apps";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

const pages = [
  { label: "Import", path: "/import", icon: <AddIcon /> },
  { label: "Projects", path: "/", icon: <AppsIcon /> },
  { label: "Query", path: "/query", icon: <ManageSearchIcon /> },
];

function NavBar() {
  return (
    <AppBar position="static" sx={{ padding: "0 20px" }}>
      <Toolbar disableGutters>
        <BiotechIcon fontSize="large" />
        <Typography
          variant="h5"
          noWrap
          component={Link}
          to="/"
          sx={{
            mr: 2,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Cytometry Viewer
        </Typography>
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "end" }}>
          {pages.map((page) => (
            <Button
              key={page.label}
              component={Link}
              to={page.path}
              startIcon={page.icon}
              sx={{
                m: 2,
                color: "white",
                border: "1px solid white",
              }}
            >
              {page.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: 0, padding: "0 20px" }}>
          <Avatar />
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          <Typography variant="body2">Bob Loblaw</Typography>
          <Typography variant="body2">Loblaw Bio</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default NavBar;
