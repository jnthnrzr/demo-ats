import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfessionalForm from '../ProfessionalForm';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import type { Professional } from '../../types.ts';

// Wrap component with router for testing
const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfessionalForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear any previous alerts
    vi.mocked(global.alert).mockClear();
  });

  it('renders all form fields', () => {
    renderWithRouter(<ProfessionalForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('allows user to input form data', async () => {
    renderWithRouter(<ProfessionalForm />);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const companyInput = screen.getByLabelText(/company name/i);

    await user.type(fullNameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(companyInput, 'Test Company');

    expect(fullNameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(companyInput).toHaveValue('Test Company');
  });

  it('updates source dropdown when selected', async () => {
    renderWithRouter(<ProfessionalForm />);

    const sourceSelect = screen.getByLabelText(/source/i);
    await user.click(sourceSelect);

    const partnerOption = screen.getByRole('option', { name: /partner/i });
    await user.click(partnerOption);

    expect(sourceSelect).toHaveTextContent(/partner/i);
  });

  it('submits form with correct data and shows success alert', async () => {
    renderWithRouter(<ProfessionalForm />);

    // Fill out the form
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/company name/i), 'Tech Corp');
    await user.type(screen.getByLabelText(/job title/i), 'Developer');
    await user.type(screen.getByLabelText(/phone/i), '123-456-7890');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Wait for the API call and success alert
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('✅ Professional added successfully!');
    });

    // Verify form was reset
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });

  it('handles form submission failure and shows error alert', async () => {
    // Override the handler to return an error
    server.use(
      http.post(/.*\/professionals\/$/, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      }),
    );

    renderWithRouter(<ProfessionalForm />);

    // Fill out required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Wait for error alert
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('❌ Failed to add professional.');
    });
  });

  it('prevents form submission with empty required fields', async () => {
    renderWithRouter(<ProfessionalForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    // The form should not call the API
    expect(global.alert).not.toHaveBeenCalled();
  });

  it('calls createProfessional API with correct payload', async () => {
    let capturedPayload: Professional | null = null;

    // Override handler to capture the payload
    server.use(
      http.post(/.*\/professionals\/$/, async ({ request }) => {
        capturedPayload = (await request.json()) as Professional;
        return HttpResponse.json(
          {
            id: '123',
            ...capturedPayload,
            created_at: new Date().toISOString(),
          },
          { status: 201 },
        );
      }),
    );

    renderWithRouter(<ProfessionalForm />);

    // Fill out the form
    const formData = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      companyName: 'Design Co',
      jobTitle: 'Designer',
      phone: '987-654-3210',
      source: 'partner',
    };

    await user.type(screen.getByLabelText(/full name/i), formData.fullName);
    await user.type(screen.getByLabelText(/email/i), formData.email);
    await user.type(screen.getByLabelText(/company name/i), formData.companyName);
    await user.type(screen.getByLabelText(/job title/i), formData.jobTitle);
    await user.type(screen.getByLabelText(/phone/i), formData.phone);

    // Change source
    const sourceSelect = screen.getByLabelText(/source/i);
    await user.click(sourceSelect);
    await user.click(screen.getByRole('option', { name: /partner/i }));

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for submission and verify payload
    await waitFor(() => {
      expect(capturedPayload).toEqual({
        full_name: formData.fullName,
        email: formData.email,
        company_name: formData.companyName,
        job_title: formData.jobTitle,
        phone: formData.phone,
        source: formData.source,
      });
    });
  });

  it('resets form fields after successful submission', async () => {
    renderWithRouter(<ProfessionalForm />);

    // Fill out all fields
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.type(screen.getByLabelText(/job title/i), 'Tester');
    await user.type(screen.getByLabelText(/phone/i), '555-1234');

    // Change source to 'internal'
    const sourceSelect = screen.getByLabelText(/source/i);
    await user.click(sourceSelect);
    await user.click(screen.getByRole('option', { name: /internal/i }));

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for success and verify form reset
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('✅ Professional added successfully!');
      expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/company name/i)).toHaveValue('');
      expect(screen.getByLabelText(/job title/i)).toHaveValue('');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('');
      expect(sourceSelect).toHaveTextContent(/direct/i); // Reset to default
    });
  });
});
