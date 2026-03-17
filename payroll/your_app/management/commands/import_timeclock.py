import csv
from django.core.management.base import BaseCommand
from your_app.models import TimeClockEntry  # replace with your actual model

class Command(BaseCommand):
    help = 'Import time clock entries from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        with open(csv_file, newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Adjust field names to match your model
                TimeClockEntry.objects.create(
                    employee_id=row['employee_id'],
                    clock_in=row['clock_in'],
                    clock_out=row['clock_out']
                )
        self.stdout.write(self.style.SUCCESS('Time clock data imported successfully!'))
