import { useState } from 'react';
import { TextField, Button, MenuItem, Typography } from '@mui/material';
import styled from 'styled-components';
import { createProfessional } from '../api/professionals';
import type { Professional } from '../types';
import StyledCard from './StyledCard';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const sources = ['direct', 'partner', 'internal'];

export default function ProfessionalForm() {
  const [form, setForm] = useState<Professional>({
    full_name: '',
    email: '',
    company_name: '',
    job_title: '',
    phone: '',
    source: 'direct',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfessional(form);
      alert('✅ Professional added successfully!');
      setForm({
        full_name: '',
        email: '',
        company_name: '',
        job_title: '',
        phone: '',
        source: 'direct',
      });
    } catch (err) {
      console.error(err);
      alert('❌ Failed to add professional.');
    }
  };

  return (
    <StyledCard>
      <Typography variant="h6" mb={2}>
        Add Professional
      </Typography>
      <FormContainer onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
        <TextField label="Email" name="email" value={form.email} onChange={handleChange} required />
        <TextField
          label="Company Name"
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
        />
        <TextField
          label="Job Title"
          name="job_title"
          value={form.job_title}
          onChange={handleChange}
        />
        <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <TextField select label="Source" name="source" value={form.source} onChange={handleChange}>
          {sources.map((src) => (
            <MenuItem key={src} value={src}>
              {src}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" size="large">
          Submit
        </Button>
      </FormContainer>
    </StyledCard>
  );
}
