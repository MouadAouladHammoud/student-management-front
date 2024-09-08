import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment } from 'src/app/models/payment.model';
import { StudentsService } from 'src/app/services/students.service';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css'],
})
export class StudentDetailsComponent implements OnInit {
  studentCode!: string;
  studentPayments!: Array<Payment>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private studentsService: StudentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentCode = this.activatedRoute.snapshot.params['code'];
    this.studentsService.getAllPaymentsForStudent(this.studentCode).subscribe({
      next: (value) => {
        this.studentPayments = value;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  newPayment() {
    this.router.navigateByUrl(`/admin/new-payment/${this.studentCode}`);
  }

  paymentDetails(payment: any) {
    this.router.navigateByUrl(`/admin/payment-details/${payment.id}`);
  }
}
