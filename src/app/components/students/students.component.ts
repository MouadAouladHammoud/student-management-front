import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Student } from 'src/app/models/student.model';
import { StudentsService } from 'src/app/services/students.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
})
export class StudentsComponent implements OnInit {
  students!: Array<Student>;

  constructor(
    private studentsService: StudentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.studentsService.getStudents().subscribe({
      next: (value) => {
        this.students = value;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  showAllPaymentsForStudent(student: Student) {
    this.router.navigateByUrl('/admin/student-details/' + student.code);
  }
}
