from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    employee_id = models.CharField(max_length=50, unique=True)
    pay_type = models.CharField(max_length=10, choices=[
        ('hourly', 'Hourly'),
        ('salary', 'Salary')
    ])
    rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class TimeEntry(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    work_date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)

class PayPeriod(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    processed = models.BooleanField(default=False)



