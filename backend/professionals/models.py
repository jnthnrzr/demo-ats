import uuid

from django.db import models

from phonenumber_field.modelfields import PhoneNumberField


class Professional(models.Model):
    SOURCE_CHOICES = [
        ("direct", "Direct"),
        ("partner", "Partner"),
        ("internal", "Internal"),
    ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, serialize=True
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = PhoneNumberField(max_length=20, unique=True, null=True, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(
                fields=["source", "-created_at"], name="prof_source_created_idx"
            ),
        ]

    def __str__(self):
        return self.email
