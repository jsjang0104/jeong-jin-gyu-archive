from rest_framework import serializers

from .models import ArchiveItem, Collection, Poem, TimelineEvent


class PoemMiniSerializer(serializers.ModelSerializer):
    """Collection 상세에서 수록 시 목록에 쓰는 축약 표현."""

    class Meta:
        model = Poem
        fields = ["id", "title", "year"]


class CollectionMiniSerializer(serializers.ModelSerializer):
    """Poem 표현 안에 중첩되는 축약 시집 정보."""

    class Meta:
        model = Collection
        fields = ["id", "title"]


class PoemMiniForItemSerializer(serializers.ModelSerializer):
    """ArchiveItem 상세에서 related_poem에 쓰는 축약 표현."""

    class Meta:
        model = Poem
        fields = ["id", "title"]


class CollectionListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    poem_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = [
            "id",
            "title",
            "title_hanja",
            "publisher",
            "year",
            "description",
            "cover_image",
            "poem_count",
        ]

    def get_cover_image(self, obj):
        request = self.context.get("request")
        if obj.cover_image and hasattr(obj.cover_image, "url"):
            url = obj.cover_image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_poem_count(self, obj):
        return obj.poems.count()


class CollectionDetailSerializer(CollectionListSerializer):
    poems = PoemMiniSerializer(many=True, read_only=True)

    class Meta(CollectionListSerializer.Meta):
        fields = CollectionListSerializer.Meta.fields + ["poems"]


class CollectionWriteSerializer(serializers.ModelSerializer):
    """관리자용 쓰기 시리얼라이저 (cover_image는 multipart 업로드로 직접 받음)."""

    class Meta:
        model = Collection
        fields = [
            "id",
            "title",
            "title_hanja",
            "publisher",
            "year",
            "description",
            "cover_image",
            "order",
        ]


class PoemListSerializer(serializers.ModelSerializer):
    collection = CollectionMiniSerializer(read_only=True)
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Poem
        fields = ["id", "title", "year", "is_featured", "collection", "excerpt"]

    def get_excerpt(self, obj):
        return obj.body[:80]


class PoemDetailSerializer(serializers.ModelSerializer):
    collection = CollectionMiniSerializer(read_only=True)

    class Meta:
        model = Poem
        fields = ["id", "title", "body", "notes", "year", "collection"]


class PoemWriteSerializer(serializers.ModelSerializer):
    """관리자용 쓰기 시리얼라이저 (collection은 id로 지정)."""

    class Meta:
        model = Poem
        fields = ["id", "title", "body", "notes", "year", "is_featured", "collection"]


class ArchiveItemListSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = ArchiveItem
        fields = [
            "id",
            "type",
            "type_display",
            "title",
            "date_text",
            "year",
            "image",
            "description",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class ArchiveItemDetailSerializer(ArchiveItemListSerializer):
    related_poem = PoemMiniForItemSerializer(read_only=True)

    class Meta(ArchiveItemListSerializer.Meta):
        fields = ArchiveItemListSerializer.Meta.fields + [
            "ocr_text",
            "source",
            "related_poem",
        ]


class ArchiveItemWriteSerializer(serializers.ModelSerializer):
    """관리자용 쓰기 시리얼라이저 (image는 multipart 업로드로 직접 받음)."""

    class Meta:
        model = ArchiveItem
        fields = [
            "id",
            "type",
            "title",
            "description",
            "date_text",
            "year",
            "image",
            "ocr_text",
            "source",
            "related_poem",
        ]


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = ["id", "year", "month", "title", "description"]
