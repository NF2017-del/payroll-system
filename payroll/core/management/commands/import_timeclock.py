import pandas as pd
from django.core.management.base import BaseCommand
from core.models import Employee, TimeEntry

class Command(BaseCommand):
    help = "Import time clock CSV"

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)

    def handle(self, *args, **kwargs):
        df = pd.read_csv(kwargs['csv_file'])

        for _, row in df.iterrows():
            try:
                employee = Employee.objects.get(employee_id=row['employee_id'])
                TimeEntry.objects.create(
                    employee=employee,
                    work_date=row['work_date'],
                    hours=row['hours']
                )
            except Employee.DoesNotExist:
                self.stdout.write(f"Employee not found: {row['employee_id']}")

