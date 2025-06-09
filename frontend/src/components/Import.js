import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";
import { useCsrfToken } from "../CsrfProvider";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function Import() {
  const csrfToken = useCsrfToken();
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a CSV file to upload.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "/api/import",
        formData,
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      alert("File uploaded successfully!");
    } catch (error) {
      alert(
        "Error uploading file: " +
          (error.response ? error.response.data : error.message)
      );
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <Container maxWidth="sm" style={{ backgroundColor: "white", padding: "20px"}}>
      <Typography variant="h4" textAlign={"center"}>
        Import CSV
      </Typography>
      <form onSubmit={handleSubmit}>
        <div style={{ margin: "20px", padding: "10px" }}>
          <Button
            component="label"
            fullWidth
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            Upload files
            <VisuallyHiddenInput
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography
              variant="body2"
              style={{ marginTop: "10px", textAlign: "center" }}
            >
              Selected file: {file.name}
            </Typography>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <Button
            type="submit"
            sx={{ width: 200 }}
            variant="contained"
            color="primary"
            disabled={!file || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
          </Button>
        </div>
      </form>
    </Container>
  );
}
