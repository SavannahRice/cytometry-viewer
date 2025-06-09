import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import axios from "axios";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function ProjectTable() {
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/results", {
        withCredentials: true,
      });
      setResults(response.data.projects);
    } catch (error) {
      setError(
        "Error fetching data: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <TableContainer component={Paper}>
      {loading ? (
        <Container style={{ margin: "40px 0", textAlign: "center" }}>
          <CircularProgress />
        </Container>
      ) : error ? (
        <Container
          style={{ color: "red", textAlign: "center", margin: "20px" }}
        >
          {error}
        </Container>
      ) : results.length === 0 ? (
        <Container style={{ textAlign: "center", margin: "20px" }}>
          <Typography>No projects found.</Typography>
        </Container>
      ) : (
        <Table aria-label="project table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Project Name</TableCell>
              <TableCell align="left">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row) => (
              <TableRow key={row.id}>
                <TableCell align="left">
                  <Link to={`/project/${row.id}`}>{row.project_name}</Link>
                </TableCell>
                <TableCell align="left">{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
