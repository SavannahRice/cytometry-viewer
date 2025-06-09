import React from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

// These are statically defined for now. In production,
// these values would be based on the values in the db
const CONDITIONS = ["melanoma", "healthy", "lung"];
const SEXES = ["male", "female"];
const TREATMENTS = ["tr1", "tr2", "None"];
const PROJECTS = ["prj1", "prj2", "prj3"];
const SAMPLE_TYPES = ["PBMC", "tumor"];

const OPERATORS = [
  { label: "=", value: "eq" },
  { label: "<", value: "lt" },
  { label: ">", value: "gt" },
];

export default function ResultQuery() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [filters, setFilters] = React.useState({
    project: null,
    condition: null,
    sampleType: null,
    sex: null,
    treatment: null,
    ageOperator: null,
    age: null,
    timeFromTreatment: null,
    timeOperator: null,
  });
  const [results, setResults] = React.useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send filters to backend as query params
    const params = {
      project: filters.project,
      condition: filters.condition,
      sample_type: filters.sampleType,
      sex: filters.sex,
      treatment: filters.treatment,
      age_operator: filters.ageOperator,
      age: filters.age,
      time_from_treatment: filters.timeFromTreatment,
      time_operator: filters.timeOperator,
    };

    const res = await axios.get("/api/results/filter", {
      params: params,
    });
    setResults(res.data.results);
  };

  console.log(results);

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{ mt: 4, backgroundColor: "white", padding: "20px" }}
      >
        <Typography variant="h5" gutterBottom>
          Query Creator
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              name="project"
              value={filters.project}
              label="Project"
              onChange={handleChange}
            >
              <MenuItem value={null}>Any</MenuItem>
              {PROJECTS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Sample Type</InputLabel>
            <Select
              name="sampleType"
              value={filters.sampleType}
              label="Sample Type"
              onChange={handleChange}
            >
              <MenuItem value={null}>Any</MenuItem>
              {SAMPLE_TYPES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              value={filters.condition}
              label="Condition"
              onChange={handleChange}
            >
              <MenuItem value={null}>Any</MenuItem>
              {CONDITIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Sex</InputLabel>
            <Select
              name="sex"
              value={filters.sex}
              label="Sex"
              onChange={handleChange}
            >
              <MenuItem value={null}>Any</MenuItem>
              {SEXES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Treatment</InputLabel>
            <Select
              name="treatment"
              value={filters.treatment}
              label="Treatment"
              onChange={handleChange}
            >
              <MenuItem value={null}>Any</MenuItem>
              {TREATMENTS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 80 }}>
              <InputLabel>Time</InputLabel>
              <Select
                name="timeOperator"
                value={filters.timeOperator}
                label="Time"
                onChange={handleChange}
              >
                {OPERATORS.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="timeFromTreatment"
              label="Time From Treatment"
              type="number"
              value={filters.timeFromTreatment}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 80 }}>
              <InputLabel>Age</InputLabel>
              <Select
                name="ageOperator"
                value={filters.ageOperator}
                label="Age"
                onChange={handleChange}
              >
                {OPERATORS.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="age"
              label="Age"
              type="number"
              value={filters.age}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <Button type="submit" variant="contained">
            Filter
          </Button>
        </Box>
      </Container>
      <Container
        maxWidth="lg"
        sx={{ mt: 4, backgroundColor: "white", padding: "20px" }}
      >
        <Typography variant="h5" gutterBottom>
          Query Results
        </Typography>

        
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
            <Container >
              <Typography>No projects found.</Typography>
            </Container>
          ) : (
            <>
              <Container sx={{ my: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Table aria-label="project table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"><b>Sample Name</b></TableCell>
                      <TableCell align="left"><b>Sample Type</b></TableCell>
                      <TableCell align="left"><b>Time From Treatment Start</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.query_results.samples.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell align="left">{row.sample_name}</TableCell>
                        <TableCell align="left">{row.sample_type}</TableCell>
                        <TableCell align="left">
                          {row.time_from_treatment_start}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Container>
              <Divider sx={{ my: 2 }} />
              <Container sx={{ my: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"><b>Project</b></TableCell>
                      <TableCell align="left"><b>Total Samples</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(
                      results.query_stats.samples_per_project
                    ).map(([project, totalSamples]) => (
                      <TableRow key={project}>
                        <TableCell align="left">{project}</TableCell>
                        <TableCell align="left">{totalSamples}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Container>
              <Divider sx={{ my: 2 }} />
              <Container sx={{ my: 4, backgroundColor: "white", borderRadius: 2, boxShadow: 1 }}>
                <Table aria-label="project table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"><b>Females #</b></TableCell>
                      <TableCell align="left"><b>Males #</b></TableCell>
                      <TableCell align="left"><b>Responders</b></TableCell>
                      <TableCell align="left"><b>Non-Responders</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow key={"females"}>
                      <TableCell align="left">
                        {results.query_stats.females}
                      </TableCell>
                      <TableCell align="left">
                        {results.query_stats.males}
                      </TableCell>
                      <TableCell align="left">
                        {results.query_stats.responders}
                      </TableCell>
                      <TableCell align="left">
                        {results.query_stats.non_responders}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Container>
            </>
          )}
        
      </Container>
    </>
  );
}
