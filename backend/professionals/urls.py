from django.urls import path

from .views import ProfessionalListCreateView, ProfessionalBulkView

urlpatterns = [
    path("professionals/", ProfessionalListCreateView.as_view(), name="professionals"),
    path(
        "professionals/bulk", ProfessionalBulkView.as_view(), name="professionals-bulk"
    ),
]
