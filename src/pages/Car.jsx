import { useState } from "react";
import "./Car.css";
import { TextField, Button } from "@mui/material";

function Car() {
  const [formData, setFormData] = useState({
    model: "",
    year: "",
    color: "",
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: false,
    });
    setSuccess(false); // Reset success on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Basic validation
    if (!formData.model.trim()) newErrors.model = true;
    if (!formData.year.trim()) {
      newErrors.year = true;
    } else {
      const yearNum = parseInt(formData.year, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear) {
        newErrors.year = true;
      }
    }
    if (!formData.color.trim()) newErrors.color = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setResult(formData);
    setErrors({});
    setSuccess(true);
    // Optional: reset form after submission
    setFormData({ model: "", year: "", color: "" });
  };

  return (
    <div className="cars-page">
      <p className="page-label">Cars Page</p>
      <h2 className="page-title">Add Car</h2>

      <div className="cars-layout">
        <form className="car-form" onSubmit={handleSubmit}>
          <TextField
            label="Model"
            name="model"
            fullWidth
            value={formData.model}
            onChange={handleChange}
            error={errors.model}
            helperText={errors.model && "Please input the car's model."}
          />

          <TextField
            label="Year"
            name="year"
            type="number"
            fullWidth
            value={formData.year}
            onChange={handleChange}
            error={errors.year}
            helperText={errors.year && "Please input a valid year (1886 - current year)."}
          />

          <TextField
            label="Color"
            name="color"
            fullWidth
            value={formData.color}
            onChange={handleChange}
            error={errors.color}
            helperText={errors.color && "Please input the car's color."}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2 }}
            disabled={
              !formData.model.trim() ||
              !formData.year.trim() ||
              !formData.color.trim()
            }
          >
            ADD CAR
          </Button>
        </form>

        {result && (
          <div className="car-result">
            <h3>Car Preview</h3>
            <p>Model: {result.model}</p>
            <p>Year: {result.year}</p>
            <p>Color: {result.color}</p>
          </div>
        )}

        {success && <p className="success-message">Car added successfully!</p>}
      </div>
    </div>
  );
}

export default Car;