from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Professional
from .serializers import ProfessionalSerializer


class ProfessionalListCreateView(generics.ListCreateAPIView):
    serializer_class = ProfessionalSerializer

    def get_queryset(self):
        source = self.request.query_params.get("source")
        if source:
            return Professional.objects.filter(source=source)
        return Professional.objects.all()


class ProfessionalBulkView(APIView):
    def post(self, request):
        results = []
        errors = []

        num_created = 0
        num_updated = 0
        for data in request.data:
            email = data.get("email")
            phone = data.get("phone")
            if not email and not phone:
                errors.append({"data": data, "status": status.HTTP_400_BAD_REQUEST})
                continue

            lookup = {"email": email} if email else {"phone": phone}
            obj, created = Professional.objects.update_or_create(
                defaults=data, **lookup
            )
            if created:
                num_created += 1
            else:
                num_updated += 1
            results.append(
                {
                    "data": data,
                    "status": (
                        status.HTTP_201_CREATED if created else status.HTTP_200_OK
                    ),
                }
            )

        return Response(
            {"results": results, "errors": errors}, status=status.HTTP_207_MULTI_STATUS
        )
