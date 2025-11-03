import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import styled from 'styled-components';
import { getProfessionals } from '../api/professionals';
import type { Professional } from '../types';
import StyledCard from './StyledCard';

const FilterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

export default function ProfessionalTable() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [source, setSource] = useState('');

  useEffect(() => {
    getProfessionals(source).then(setProfessionals);
  }, [source]);

  return (
    <StyledCard>
      <Typography variant="h6" mb={2}>
        Professionals
      </Typography>

      <FilterBar>
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Sources</MenuItem>
          <MenuItem value="direct">Direct</MenuItem>
          <MenuItem value="partner">Partner</MenuItem>
          <MenuItem value="internal">Internal</MenuItem>
        </Select>
      </FilterBar>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {professionals.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.full_name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.company_name}</TableCell>
                <TableCell>{p.job_title}</TableCell>
                <TableCell>{p.phone}</TableCell>
                <TableCell>{p.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledCard>
  );
}
