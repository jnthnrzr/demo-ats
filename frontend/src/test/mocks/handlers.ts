import { http, HttpResponse } from 'msw';
import type { Professional } from '../../types.ts';

export const handlers = [
  // GET /professionals/ - matches any URL ending with /professionals/
  http.get(/.*\/professionals\/$/, ({ request }) => {
    const url = new URL(request.url);
    const source = url.searchParams.get('source');

    const mockProfessionals = [
      {
        id: 'c68653a1-d289-4357-96f7-adbb9d2d0468',
        full_name: 'John Doe',
        email: 'john@example.com',
        company_name: 'Tech Corp',
        job_title: 'Software Engineer',
        phone: '123-456-7890',
        source: 'direct',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '8492bfb5-1156-438f-b612-aa2f07d87ccb',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        company_name: 'Design Inc',
        job_title: 'UX Designer',
        phone: '987-654-3210',
        source: 'partner',
        created_at: '2024-01-02T00:00:00Z',
      },
      {
        id: 'f3865103-00c3-4b3a-9ad7-f6773e8167d1',
        full_name: 'Bob Johnson',
        email: 'bob@example.com',
        company_name: 'Dev Agency',
        job_title: 'Product Manager',
        phone: '555-123-4567',
        source: 'internal',
        created_at: '2024-01-03T00:00:00Z',
      },
    ];

    if (source) {
      const filtered = mockProfessionals.filter((p) => p.source === source);
      return HttpResponse.json(filtered);
    }

    return HttpResponse.json(mockProfessionals);
  }),

  // POST /professionals/
  http.post(/.*\/professionals\/$/, async ({ request }) => {
    const body = (await request.json()) as Professional;

    const newProfessional = {
      id: String(Math.random()),
      ...body,
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json(newProfessional, { status: 201 });
  }),
];
