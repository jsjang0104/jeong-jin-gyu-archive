from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

from . import ai_service
from .models import ArchiveItem, Collection, Poem, TimelineEvent
from .serializers import (
    ArchiveItemDetailSerializer,
    ArchiveItemListSerializer,
    ArchiveItemWriteSerializer,
    CollectionDetailSerializer,
    CollectionListSerializer,
    CollectionWriteSerializer,
    PoemDetailSerializer,
    PoemListSerializer,
    PoemWriteSerializer,
    TimelineEventSerializer,
)


class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CollectionWriteSerializer
        if self.action == "retrieve":
            return CollectionDetailSerializer
        return CollectionListSerializer


class PoemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Poem.objects.all()
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(body__icontains=q))
        collection_id = self.request.query_params.get("collection")
        if collection_id:
            queryset = queryset.filter(collection_id=collection_id)
        featured = self.request.query_params.get("featured")
        if featured is not None:
            featured_bool = featured.lower() in ("1", "true", "yes")
            queryset = queryset.filter(is_featured=featured_bool)
        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return PoemWriteSerializer
        if self.action == "retrieve":
            return PoemDetailSerializer
        return PoemListSerializer


class ArchiveItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = ArchiveItem.objects.all()
        item_type = self.request.query_params.get("type")
        if item_type:
            queryset = queryset.filter(type=item_type)
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(Q(title__icontains=q) | Q(description__icontains=q))
        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ArchiveItemWriteSerializer
        if self.action == "retrieve":
            return ArchiveItemDetailSerializer
        return ArchiveItemListSerializer


class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


@api_view(["GET"])
def summary_view(request):
    items_qs = ArchiveItem.objects.all()
    items_breakdown = {
        choice_value: items_qs.filter(type=choice_value).count()
        for choice_value, _label in ArchiveItem.ItemType.choices
    }
    return Response(
        {
            "poems": Poem.objects.count(),
            "collections": Collection.objects.count(),
            "items": items_breakdown,
        }
    )


class ArchiveAIExtractView(APIView):
    """이미지 업로드 -> Gemini 멀티모달 OCR/분류 제안."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get("image")
        hint = request.data.get("hint", "")
        if not image_file:
            return Response({"error": "image 파일이 필요합니다."}, status=400)

        image_bytes = image_file.read()
        mime_type = image_file.content_type or "image/jpeg"
        result = ai_service.extract_from_image(image_bytes, mime_type, hint)
        return Response(result)
