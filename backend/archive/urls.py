from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ArchiveAIExtractView,
    ArchiveItemViewSet,
    CollectionViewSet,
    PoemViewSet,
    TimelineEventViewSet,
    summary_view,
)

router = DefaultRouter()
router.register(r"collections", CollectionViewSet, basename="collection")
router.register(r"poems", PoemViewSet, basename="poem")
router.register(r"archive-items", ArchiveItemViewSet, basename="archiveitem")
router.register(r"timeline", TimelineEventViewSet, basename="timelineevent")

urlpatterns = [
    path("summary/", summary_view, name="summary"),
    path("ai/extract/", ArchiveAIExtractView.as_view(), name="ai-extract"),
    path("", include(router.urls)),
]
