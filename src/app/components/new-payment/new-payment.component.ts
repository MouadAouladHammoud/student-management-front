import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Payment, PaymentType } from 'src/app/models/payment.model';
import { StudentsService } from 'src/app/services/students.service';

@Component({
  selector: 'app-new-payment',
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.css'],
})
export class NewPaymentComponent implements OnInit {
  studentCode!: string;
  paymentTypes: string[] = [];
  pdfFileUrl!: string;
  paymentFormGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private studentsService: StudentsService
  ) {}

  ngOnInit(): void {
    for (let elm in PaymentType) {
      let value = PaymentType[elm];
      if (typeof value === 'string') this.paymentTypes.push(PaymentType[elm]);
    }
    this.studentCode = this.activatedRoute.snapshot.params['studentCode'];
    this.paymentFormGroup = this.formBuilder.group({
      date: this.formBuilder.control('2024-08-28'),
      amount: this.formBuilder.control(''),
      type: this.formBuilder.control(''),
      studentCode: this.formBuilder.control(this.studentCode),
      fileSource: this.formBuilder.control(''),
      fileName: this.formBuilder.control(''),
    });
  }

  selectFile(event: Event) {
    const input = event.target as HTMLInputElement; // Convertir en HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.paymentFormGroup.patchValue({
        fileSource: file,
        fileName: file.name,
      });
      this.pdfFileUrl = window.URL.createObjectURL(file);
    }
  }

  afterLoadComplete(event: any) {
    console.log(event);
  }

  savePayment() {
    let date: Date = new Date(this.paymentFormGroup.value.date);
    let formatedDate =
      date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    let formData = new FormData();
    formData.set('date', this.paymentFormGroup.value.date);
    formData.set('amount', this.paymentFormGroup.value.amount);
    formData.set('type', this.paymentFormGroup.value.type);
    formData.set('studentCode', this.paymentFormGroup.value.studentCode);
    formData.set('file', this.paymentFormGroup.value.fileSource);
    this.studentsService.savePayment(formData).subscribe({
      next: (value: Payment) => {
        alert('done');
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
