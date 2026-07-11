"""
데모 데이터 시드 커맨드.

- 시집(Collection) 18권, 연보(TimelineEvent), 시(Poem, 본문은 플레이스홀더),
  아카이브 자료(ArchiveItem, 네이버 블로그 아카이브에서 파싱한 실제 자료)를 생성한다.
- 이미지가 있는 ArchiveItem은 backend/media/seed/ 에 미리 다운로드되어 커밋된
  실제 이미지 파일을 가리키도록 연결한다(재다운로드하지 않는다).
- 반복 실행해도 안전하다(idempotent) — 이미 존재하는 레코드는 건너뛴다.
- admin/gyeongsan2026 슈퍼유저 계정을 생성한다(이미 있으면 건너뜀).
"""

import json
from pathlib import Path

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from archive.models import ArchiveItem, Collection, Poem, TimelineEvent

FIXTURES_DIR = Path(__file__).resolve().parent.parent.parent / "fixtures"

PLACEHOLDER_BODY = (
    "(데모용 자리표시 텍스트입니다. 실제 시 본문은 저작권자 확인 후 등재합니다.)\n"
    "\n"
    "여기에 시의 전문이\n"
    "연과 행을 살려\n"
    "이 자리에 놓입니다.\n"
    "\n"
    "지금은 비어 있어도\n"
    "곧 채워질 자리이니\n"
    "그 여백도 시의 일부로\n"
    "가만히 두어 봅니다."
)


def _load(filename):
    with open(FIXTURES_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


class Command(BaseCommand):
    help = "정진규 아카이브 데모 데이터를 시드한다 (멱등)."

    def handle(self, *args, **options):
        self.stdout.write("=== 정진규 아카이브 데모 시드 시작 ===")

        collections_created = self._seed_collections()
        timeline_created = self._seed_timeline()
        poems_created = self._seed_poems()
        items_created, items_with_image = self._seed_archive_items()
        superuser_created = self._seed_superuser()

        self.stdout.write(self.style.SUCCESS("=== 시드 완료 ==="))
        self.stdout.write(
            f"Collection: {collections_created}건 생성 (총 {Collection.objects.count()}건)"
        )
        self.stdout.write(
            f"TimelineEvent: {timeline_created}건 생성 (총 {TimelineEvent.objects.count()}건)"
        )
        self.stdout.write(f"Poem: {poems_created}건 생성 (총 {Poem.objects.count()}건)")
        self.stdout.write(
            f"ArchiveItem: {items_created}건 생성 (총 {ArchiveItem.objects.count()}건, "
            f"이미지 연결 {items_with_image}건 / 전체 이미지 보유 "
            f"{ArchiveItem.objects.exclude(image='').filter(image__isnull=False).count()}건)"
        )
        self.stdout.write(
            "Superuser(admin): " + ("생성됨" if superuser_created else "이미 존재함 (건너뜀)")
        )

    def _seed_collections(self):
        data = _load("seed_collections.json")
        created_count = 0
        for row in data:
            _, created = Collection.objects.get_or_create(
                title=row["title"],
                defaults={
                    "title_hanja": row.get("title_hanja") or None,
                    "publisher": row.get("publisher") or None,
                    "year": row.get("year"),
                    "description": row.get("description", ""),
                    "order": row.get("order", 0),
                },
            )
            if created:
                created_count += 1
        return created_count

    def _seed_timeline(self):
        data = _load("seed_timeline.json")
        created_count = 0
        for row in data:
            _, created = TimelineEvent.objects.get_or_create(
                year=row["year"],
                month=row.get("month"),
                title=row["title"],
                defaults={"description": row.get("description", "")},
            )
            if created:
                created_count += 1
        return created_count

    def _seed_poems(self):
        data = _load("seed_poems.json")
        created_count = 0
        for row in data:
            collection = None
            collection_title = row.get("collection_title")
            if collection_title:
                collection = Collection.objects.filter(title=collection_title).first()

            _, created = Poem.objects.get_or_create(
                title=row["title"],
                defaults={
                    "body": PLACEHOLDER_BODY,
                    "collection": collection,
                    "year": row.get("year"),
                    "is_featured": row.get("is_featured", False),
                    "notes": row.get("notes", ""),
                },
            )
            if created:
                created_count += 1
        return created_count

    def _seed_archive_items(self):
        data = _load("seed_archive_items.json")
        created_count = 0
        with_image_count = 0
        for row in data:
            item, created = ArchiveItem.objects.get_or_create(
                title=row["title"],
                defaults={
                    "type": row["type"],
                    "description": row.get("description", ""),
                    "date_text": row.get("date_text", ""),
                    "year": row.get("year"),
                    "source": "네이버 블로그 아카이브",
                },
            )
            if created:
                created_count += 1

            image_file = row.get("image_file")
            if image_file and not item.image:
                # 이미지는 backend/media/seed/ 에 이미 실제 파일로 존재한다.
                # ImageField.save()로 재복사하지 않고, 기존 파일을 직접 가리키게 한다.
                item.image.name = f"seed/{image_file}"
                item.save(update_fields=["image"])
                with_image_count += 1
            elif image_file and item.image:
                with_image_count += 1

        return created_count, with_image_count

    def _seed_superuser(self):
        if User.objects.filter(username="admin").exists():
            return False
        User.objects.create_superuser("admin", "admin@example.com", "gyeongsan2026")
        return True
