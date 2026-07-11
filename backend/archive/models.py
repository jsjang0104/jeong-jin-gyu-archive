from django.db import models


class Collection(models.Model):
    """시집"""

    title = models.CharField("제목", max_length=200)
    title_hanja = models.CharField("한자 제목", max_length=200, null=True, blank=True)
    publisher = models.CharField("출판사", max_length=200, null=True, blank=True)
    year = models.IntegerField("발행 연도", null=True, blank=True)
    description = models.TextField("소개", blank=True)
    cover_image = models.ImageField("표지 이미지", upload_to="collections/", null=True, blank=True)
    order = models.IntegerField("정렬 순서", default=0)

    class Meta:
        verbose_name = "시집"
        verbose_name_plural = "시집 목록"
        ordering = ["order", "year"]

    def __str__(self):
        return self.title


class Poem(models.Model):
    """시"""

    title = models.CharField("제목", max_length=200)
    body = models.TextField("본문")
    collection = models.ForeignKey(
        Collection,
        verbose_name="수록 시집",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="poems",
    )
    year = models.IntegerField("연도", null=True, blank=True)
    is_featured = models.BooleanField("추천(홈 노출)", default=False)
    notes = models.TextField("해설/출처 메모", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "시"
        verbose_name_plural = "시 목록"
        ordering = ["-is_featured", "year", "title"]

    def __str__(self):
        return self.title


class ArchiveItem(models.Model):
    """아카이브 자료"""

    class ItemType(models.TextChoices):
        MANUSCRIPT = "MANUSCRIPT", "육필"
        ARTIFACT = "ARTIFACT", "유품"
        DOCUMENT = "DOCUMENT", "문헌"
        PHOTO = "PHOTO", "사진"

    type = models.CharField("유형", max_length=20, choices=ItemType.choices)
    title = models.CharField("제목", max_length=300)
    description = models.TextField("설명", blank=True)
    date_text = models.CharField("연대(자유 표기)", max_length=100, blank=True)
    year = models.IntegerField("연도(정렬용)", null=True, blank=True)
    image = models.ImageField("이미지", upload_to="archive_items/", null=True, blank=True)
    ocr_text = models.TextField("판독/AI 추출 텍스트", blank=True)
    source = models.CharField("출처", max_length=200, blank=True, default="네이버 블로그 아카이브")
    related_poem = models.ForeignKey(
        Poem,
        verbose_name="관련 시",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="related_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "아카이브 자료"
        verbose_name_plural = "아카이브 자료 목록"
        ordering = ["-year", "title"]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title}"


class TimelineEvent(models.Model):
    """연보"""

    year = models.IntegerField("연도")
    month = models.IntegerField("월", null=True, blank=True)
    title = models.CharField("사건", max_length=300)
    description = models.TextField("설명", blank=True)

    class Meta:
        verbose_name = "연보 이벤트"
        verbose_name_plural = "연보"
        ordering = ["year", "month"]

    def __str__(self):
        month_part = f".{self.month}" if self.month else ""
        return f"{self.year}{month_part} {self.title}"
