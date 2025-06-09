import * as React from "react";
import Container from "@mui/material/Container";
import axios from "axios";
import { useParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Plot from "react-plotly.js";
import { tTestTwoSample } from "simple-statistics";

const columns = [
  { field: "id", headerName: "Cell ID", width: 90, hide: true },
  {
    field: "sample_name",
    headerName: "Sample Name",
    width: 150,
  },
  {
    field: "population",
    headerName: "Population",
    width: 150,
  },
  {
    field: "total_count",
    headerName: "Total Count",
    type: "number",
    width: 110,
  },
  {
    field: "count",
    headerName: "Cell Count",
    type: "number",
    width: 110,
  },
  {
    field: "relative_frequency",
    headerName: "Relative Frequency (%)",
    type: "number",
    width: 180,
  },
];

export default function Project() {
  const { projectId } = useParams();
  const [rows, setRows] = React.useState([]);
  const [subjects, setSubjects] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `/api/results/${projectId}`,
        {
          withCredentials: true,
        }
      );
      setRows(response.data.project_data.samples);
      setSubjects(response.data.project_data.subjects);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const pbmcRows = rows.filter(
    (row) => row.sample_type === "PBMC" 
  );

  const grouped = {
    responders: pbmcRows.filter((row) => row.response === true),
    nonResponders: pbmcRows.filter((row) => row.response === false),
  };

  // Aggregate average relative frequency for each population
  function aggregateByPopulation(rows) {
    const popMap = {};
    rows.forEach((row) => {
      if (!popMap[row.population]) popMap[row.population] = [];
      popMap[row.population].push(row.relative_frequency);
    });
    return Object.entries(popMap).map(([population, freqs]) => ({
      population,
      avg: freqs.reduce((a, b) => a + b, 0) / freqs.length,
    }));
  }

  const responderData = aggregateByPopulation(grouped.responders);
  const nonResponderData = aggregateByPopulation(grouped.nonResponders);

  // Merge for chart
  const chartData = responderData.map((res) => {
    const nonRes = nonResponderData.find(
      (nr) => nr.population === res.population
    ) || { avg: 0 };
    return {
      population: res.population,
      Responders: res.avg,
      NonResponders: nonRes.avg,
    };
  });

  function getBoxplotData(populations, grouped) {
    return populations.map((population) => ({
      population,
      responders: grouped.responders
        .filter((row) => row.population === population)
        .map((row) => row.relative_frequency),
      nonResponders: grouped.nonResponders
        .filter((row) => row.population === population)
        .map((row) => row.relative_frequency),
    }));
  }

  const populations = Array.from(new Set(rows.map((row) => row.population)));
  

  const boxplotData = getBoxplotData(populations, grouped);

  function getSignificantPopulations(boxplotData, alpha = 0.05) {
    return boxplotData.map((pop) => {
      const { responders, nonResponders, population } = pop;
      // Only test if both groups have at least 2 values
      if (responders.length > 1 && nonResponders.length > 1) {
        const res = tTestTwoSample(responders, nonResponders, 0);
            return {
            population,
            pValue: res,
            significant: res < alpha,
            };
      }

      return {
        population,
        pValue: null,
        significant: false,
      };
    });
  }
  const significantResults = getSignificantPopulations(boxplotData);
return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
        <Box sx={{ height: "500px", width: "100%", marginBottom: "80px" }}>
            <Typography variant="h4" gutterBottom>
                Sample Summary
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                disableRowSelectionOnClick
            />
        </Box>
        <Box maxWidth="lg" style={{ marginTop: "20px"}}>
            <Typography variant="h4" gutterBottom>Charts</Typography>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Cell Population Relative Frequencies of Melanoma Patients Receiving tr1</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="population" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Responders" fill="#1976d2" />
                            <Bar dataKey="NonResponders" fill="gray" />
                        </BarChart>
                    </ResponsiveContainer>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Population Relative Frequencies of Responders vs. Non-Responders</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{overflowY: "auto", height: "600px" }}>
                        <Plot
                            data={[
                                ...boxplotData.map((pop) => ({
                                    y: pop.responders,
                                    type: "box",
                                    name: `${pop.population} (Responder)`,
                                    marker: { color: "#1976d2" },
                                    boxpoints: "all",
                                    jitter: 0.5,
                                    pointpos: -1.8,
                                    showlegend: false,
                                })),
                                ...boxplotData.map((pop) => ({
                                    y: pop.nonResponders,
                                    type: "box",
                                    name: `${pop.population} (Non-responder)`,
                                    marker: { color: "gray" },
                                    boxpoints: "all",
                                    jitter: 0.5,
                                    pointpos: -1.8,
                                    showlegend: false,
                                })),
                            ]}
                            layout={{
                                title:
                                    "Relative Frequency by Population (Responders vs Non-Responders)",
                                yaxis: { title: "Relative Frequency (%)" },
                                boxmode: "group",
                                margin: { t: 5, b:-10 },
                                autosize: true,
                            }}
                            style={{ width: "100%", height: "100%" }} // or "100%" for height if parent allows
                            useResizeHandler={true}
                        />
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Statistical Test Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ my: 2 }}>
                        <h3>Statistical Test Results</h3>
                        <ul>
                            {significantResults.map((res) => (
                                <li key={res.population}>
                                    <strong>{res.population}:</strong>{" "}
                                    {res.pValue !== null
                                        ? `p = ${res.pValue.toExponential(2)}${
                                                res.significant ? " (significant)" : ""
                                            }`
                                        : "Not enough data"}
                                </li>
                            ))}
                        </ul>
                        <p>
                            <em>
                                Populations with p &lt; 0.05 are considered significantly
                                different between responders and non-responders.
                            </em>
                        </p>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    </Container>
);
}
