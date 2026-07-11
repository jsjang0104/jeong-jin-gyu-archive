from django.contrib import admin
from django.utils.html import format_html

from .models import ArchiveItem, Collection, Poem, TimelineEvent


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("order", "year", "title", "title_hanja", "publisher", "poem_count")
    list_filter = ("publisher",)
    search_fields = ("title", "title_hanja", "publisher")
    ordering = ("order", "year")

    def poem_count(self, obj):
        return obj.poems.count()

    poem_count.short_description = "수록 시 수"


@admin.register(Poem)
class PoemAdmin(admin.ModelAdmin):
    list_display = ("title", "year", "collection", "is_featured", "created_at")
    list_filter = ("is_featured", "collection")
    search_fields = ("title", "body", "notes")
    autocomplete_fields = ()


@admin.register(ArchiveItem)
class ArchiveItemAdmin(admin.ModelAdmin):
    list_display = ("id", "thumbnail", "title", "type", "date_text", "year", "source")
    list_filter = ("type",)
    search_fields = ("title", "description", "ocr_text")
    ordering = ("-year", "title")

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:48px;" />', obj.image.url)
        return "-"

    thumbnail.short_description = "이미지"


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ("year", "month", "title")
    list_filter = ("year",)
    search_fields = ("title", "description")
    ordering = ("year", "month")
