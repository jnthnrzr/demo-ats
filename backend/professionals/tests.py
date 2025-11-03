from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Professional


class ProfessionalAPITestCase(APITestCase):
    def setUp(self):
        self.create_url = reverse("professionals")
        self.bulk_url = reverse("professionals-bulk")

    def test_create_professional_passes_for_happy_path(self):
        data = {
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "phone": "604 401 1234",
            "company_name": "Acme Inc.",
            "job_title": "Engineer",
            "source": "direct",
        }

        response = self.client.post(self.create_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Professional.objects.count(), 1)
        prof = Professional.objects.get()
        self.assertEqual(prof.full_name, "Alice Smith")

    def test_create_professional_fails_for_invalid_email(self):
        data = {
            "full_name": "Alice Smith",
            "email": "not-an-email",
            "phone": "604 401 1234",
            "company_name": "Acme Inc.",
            "job_title": "Engineer",
            "source": "direct",
        }

        response = self.client.post(self.create_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "errors": [
                    {
                        "attr": "email",
                        "code": "invalid",
                        "detail": "Enter a valid email address.",
                    }
                ],
                "type": "validation_error",
            },
        )

    def test_create_professional_fails_for_invalid_phone(self):
        data = {
            "full_name": "Pablo Picasso",
            "email": "pablo@artist.com",
            "phone": "111 222 3333",
            "company_name": "Dreamworks",
            "job_title": "Product Designer",
            "source": "internal",
        }

        response = self.client.post(self.create_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "errors": [
                    {
                        "attr": "phone",
                        "code": "invalid",
                        "detail": "The phone number entered is not valid.",
                    }
                ],
                "type": "validation_error",
            },
        )

    def test_create_professional_fails_for_invalid_source(self):
        data = {
            "full_name": "Pablo Picasso",
            "email": "pablo@artist.com",
            "phone": "604 401 1234",
            "company_name": "Dreamworks",
            "job_title": "Product Designer",
            "source": "api",
        }

        response = self.client.post(self.create_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "errors": [
                    {
                        "attr": "source",
                        "code": "invalid_choice",
                        "detail": '"api" is not a valid choice.',
                    }
                ],
                "type": "validation_error",
            },
        )

    def test_list_professionals(self):
        Professional.objects.create(
            full_name="John Doe", phone="212-999-0000", source="direct"
        )
        Professional.objects.create(
            full_name="Jane Doe",
            email="janedoe@example.com",
            phone="212-111-2222",
            source="internal",
        )

        response = self.client.get(self.create_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_bulk_upsert_create_and_update(self):
        # Initial creation
        data = [
            {
                "full_name": "Bob",
                "email": "bob@example.com",
                "phone": "212-123-2222",
                "source": "direct",
            },
            {
                "full_name": "Charlie",
                "email": "charlie@example.com",
                "phone": "212-123-5555",
                "source": "partner",
            },
        ]
        response = self.client.post(self.bulk_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)
        self.assertEqual(Professional.objects.count(), 2)

        # Update Bob
        update_data = [
            {
                "full_name": "Robert Frost",
                "email": "bob@example.com",
                "phone": "212-123-2222",
                "source": "internal",
            }
        ]
        response = self.client.post(self.bulk_url, update_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)

        prof = Professional.objects.get(email="bob@example.com")
        self.assertEqual(prof.full_name, "Robert Frost")
        self.assertEqual(prof.source, "internal")

    def test_bulk_upsert_partial_failure(self):
        data = [
            {
                "full_name": "Good Professional",
                "phone": "212-555-7777",
                "source": "direct",
            },
            {"full_name": "Bad Professional", "email": "invalid", "phone": ""},
        ]

        response = self.client.post(self.bulk_url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_207_MULTI_STATUS)
        self.assertTrue(
            Professional.objects.filter(full_name="Good Professional").exists()
        )
