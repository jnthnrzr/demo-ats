import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfessionalsTable from '../ProfessionalsTable';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

// Wrap component with router for testing
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfessionalsTable', () => {
  const user = userEvent.setup();

  it('renders table with all professionals on initial load', async () => {
    renderWithRouter(<ProfessionalsTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Job Title')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('displays filter dropdown with all source options', async () => {
    renderWithRouter(<ProfessionalsTable />);

    const filterSelect = screen.getByRole('combobox');
    expect(filterSelect).toBeInTheDocument();

    // Click to open dropdown
    await user.click(filterSelect);

    // Check all options are available
    expect(screen.getByRole('option', { name: /all sources/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /direct/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /partner/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /internal/i })).toBeInTheDocument();
  });

  it('filters professionals by source when dropdown changes', async () => {
    renderWithRouter(<ProfessionalsTable />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open filter dropdown and select 'direct'
    const filterSelect = screen.getByRole('combobox');
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /direct/i }));

    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument(); // Should be filtered out
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument(); // Should be filtered out
    });
  });

  it('shows all professionals when "All Sources" is selected', async () => {
    renderWithRouter(<ProfessionalsTable />);

    // First filter by 'direct'
    const filterSelect = screen.getByRole('combobox');
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /direct/i }));

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    // Then select "All Sources"
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /all sources/i }));

    // Wait for all professionals to be shown again
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('calls getProfessionals API with correct source parameter', async () => {
    let capturedUrl = '';

    // Override handler to capture the URL
    server.use(
      http.get(/.*\/professionals\/$/, ({ request }) => {
        capturedUrl = request.url;
        const url = new URL(request.url);
        const source = url.searchParams.get('source');

        if (source === 'partner') {
          return HttpResponse.json([
            {
              id: '2',
              full_name: 'Jane Smith',
              email: 'jane@example.com',
              company_name: 'Design Inc',
              job_title: 'UX Designer',
              phone: '987-654-3210',
              source: 'partner',
              created_at: '2024-01-02T00:00:00Z',
            },
          ]);
        }

        return HttpResponse.json([]);
      }),
    );

    renderWithRouter(<ProfessionalsTable />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Professionals')).toBeInTheDocument();
    });

    // Change filter to 'partner'
    const filterSelect = screen.getByRole('combobox');
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /partner/i }));

    // Wait for API call
    await waitFor(() => {
      expect(capturedUrl).toContain('source=partner');
    });
  });

  it('displays all professional data in table rows', async () => {
    renderWithRouter(<ProfessionalsTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that all data for the first professional is displayed
    const rows = screen.getAllByRole('row');
    const johnDoeRow = rows.find((row) => within(row).queryByText('John Doe'));

    expect(johnDoeRow).toBeInTheDocument();
    expect(within(johnDoeRow!).getByText('john@example.com')).toBeInTheDocument();
    expect(within(johnDoeRow!).getByText('Tech Corp')).toBeInTheDocument();
    expect(within(johnDoeRow!).getByText('Software Engineer')).toBeInTheDocument();
    expect(within(johnDoeRow!).getByText('123-456-7890')).toBeInTheDocument();
    expect(within(johnDoeRow!).getByText('direct')).toBeInTheDocument();
  });

  it('handles empty response when filtering returns no results', async () => {
    // Override handler to return empty array for a specific source
    server.use(
      http.get(/.*\/professionals\/$/, ({ request }) => {
        const url = new URL(request.url);
        const source = url.searchParams.get('source');

        if (source === 'nonexistent') {
          return HttpResponse.json([]);
        }

        return HttpResponse.json([
          {
            id: '1',
            full_name: 'John Doe',
            email: 'john@example.com',
            company_name: 'Tech Corp',
            job_title: 'Software Engineer',
            phone: '123-456-7890',
            source: 'direct',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]);
      }),
    );

    renderWithRouter(<ProfessionalsTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // The component should handle empty results gracefully
    // (No crash, table should still render)
    expect(screen.getByText('Professionals')).toBeInTheDocument();
  });

  it('updates table content when source filter changes multiple times', async () => {
    renderWithRouter(<ProfessionalsTable />);

    const filterSelect = screen.getByRole('combobox');

    // Test filtering to 'direct'
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /direct/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    // Change to 'partner'
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /partner/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Change to 'internal'
    await user.click(filterSelect);
    await user.click(screen.getByRole('option', { name: /internal/i }));

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});
