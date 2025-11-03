# Demo ATS (Applicant Tracking System)

A full-stack applicant tracking system demo built with Django REST Framework (backend) and React with TypeScript (frontend).

## Tech Stack

### Backend
- Django 5.2.7
- Django REST Framework
- PostgreSQL
- Python 3.13
- uv (package manager)

### Frontend
- React 19
- TypeScript
- Vite
- Material-UI (MUI)
- Axios
- Vitest & React Testing Library (for testing)

## Prerequisites

- **Python 3.13** (for backend)
- **Node.js 18+** and npm (for frontend)
- **PostgreSQL 16** (or use Docker)
- **Docker & Docker Compose** (optional, for containerized setup)
- **uv** (Python package manager) - Install from https://github.com/astral-sh/uv

## Installation

### Option 1: Docker Compose (Recommended)

This is the easiest way to run the entire application:

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd demo-ats
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Django backend on port 8000
   - React frontend on port 3000

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

### Option 2: Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install uv** (if not already installed):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Create and activate virtual environment**:
   ```bash
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```bash
   uv pip install -e .
   ```

   Or install with dev dependencies:
   ```bash
   uv pip install -e ".[dev]"
   ```

5. **Set up PostgreSQL database**:
   - Create a PostgreSQL database named `ats_db` (or your preferred name)
   - Note the database credentials

6. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

7. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

   Or using uvicorn (as in production):
   ```bash
   uvicorn api.asgi:application --host 0.0.0.0 --port 8000
   ```

   The backend will be available at http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

## Troubleshooting

### Backend Issues

- **Database connection errors**: Ensure PostgreSQL is running and credentials in `.env.local` are correct
- **Migration errors**: Run `python manage.py migrate` to apply migrations
- **Module not found**: Activate virtual environment and ensure dependencies are installed with `uv pip install -e .`

### Frontend Issues

- **API connection errors**: Verify `VITE_API_URL` in `.env.local` matches your backend URL
- **Port already in use**: Change the port in `vite.config.ts` or stop the conflicting process
- **Module not found**: Run `npm install` to install dependencies

### Docker Issues

- **Build failures**: Ensure Docker and Docker Compose are installed and running
- **Port conflicts**: Modify ports in `docker-compose.yml` if 3000, 8000, or 5432 are in use
- **Database not ready**: Wait a few seconds after starting containers for the database to initialize

### Assumptions/Trade-offs

- The project is set up for development only i.e. the project is not ready to be deployed to prod.
- There is no authentication, caching, rate limiting, monitoring/logging implemented and environment variables are public for development purposes only.
- Pagination has been skipped for the backend API and there is no support for HTTPS, instead relying on HTTP for local environment only.
- While frontend and backend tests can be run separately, there is no integration test present in the project.
- The docker images are lacking multi-stage builds.
- Bulk updates are handled sequentially with no concurrency or batching implemented.

## Extension

The system does **not currently process or interpret uploaded PDF content** for professionals. The `Professional` model only stores basic fields (`full_name`, `email`, `phone`, `company_name`, `job_title`, `source`), and there is no file upload or PDF parsing functionality implemented.

To add PDF processing capabilities, the following components would need to be implemented:

#### 1. **Backend Changes**

**Model Updates:**
- Add a `FileField` to the `Professional` model in order to store the uploaded PDF file.
- Optionally add fields like `resume_text` (for extracted text) or `parsed_data` (JSON field for structured extracted information).

**Dependencies:**
- PDF parsing library (e.g., `pypdf`, `pdfplumber`, `PyMuPDF`/`fitz`)
- Potentially `django-storages` if using cloud storage (S3, etc.)
- File handling utilities for validation and storage

**New View/Endpoint:**
- An API endpoint `POST /api/professionals/` to handle PDF file uploads (multipart/form-data)
- Processing logic to extract text and parse structured information from the PDF
- Validation for file type and size

#### 2. **Processing Workflow**

A typical PDF processing workflow would include:

1. **Upload Handling**: Receive the PDF file via API endpoint
2. **Text Extraction**: Extract raw text content from the PDF using a parsing library
3. **Information Extraction**: Parse the extracted text to identify:
   - Name
   - Contact information (email, phone)
   - Current/previous job titles
   - Company names
   - Skills and qualifications
   - Work experience and education
4. **Data Mapping**: Map parsed information to the `Professional` model fields
5. **Storage**: Save both the link to the PDF file and extracted/parsed data to the database while the file may be stored in AWS S3.

#### 3. **Parsing Approaches**

There are several approaches to extracting structured data from PDFs:

- **Rule-based Parsing**: Use regex patterns and keyword matching to identify sections and extract information
- **Machine Learning-based**: Utilize specialized resume/CV parsing libraries that use ML models trained on structured documents
- **LLM-based Extraction**: Use Large Language Model APIs (OpenAI, Anthropic, etc.) to extract structured data from the PDF text, which can be particularly effective for handling varied resume formats

#### 4. **Frontend Changes**

- File upload input component in the `ProfessionalForm`
- File preview and validation on the client side
- Display of uploaded resume/document in the professional's profile
- Potentially show extracted data alongside manual entry fields for review and correction
