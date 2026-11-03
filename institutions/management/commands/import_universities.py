"""Import Indian universities from the public Hipo Labs dataset.

    python manage.py import_universities

Safe to re-run: names that already exist (case-insensitive) are skipped.
"""

import json
import urllib.request

from django.core.management.base import BaseCommand, CommandError

from institutions.models import University

SOURCE = "http://universities.hipolabs.com/search?country=India"


class Command(BaseCommand):
    help = "Import Indian universities from the Hipo Labs open dataset."

    def handle(self, *args, **options):
        try:
            with urllib.request.urlopen(SOURCE, timeout=30) as resp:
                rows = json.load(resp)
        except Exception as exc:  # network / JSON problems
            raise CommandError(f"Could not download the university list: {exc}")

        existing = {n.lower() for n in University.objects.values_list("name", flat=True)}
        created = []
        for row in rows:
            name = (row.get("name") or "").strip()[:200]
            if not name or name.lower() in existing:
                continue
            existing.add(name.lower())
            pages = row.get("web_pages") or []
            created.append(
                University(
                    name=name,
                    location=(row.get("state-province") or "")[:200],
                    website=pages[0][:200] if pages else "",
                )
            )
        University.objects.bulk_create(created)
        self.stdout.write(self.style.SUCCESS(f"Imported {len(created)} universities."))
