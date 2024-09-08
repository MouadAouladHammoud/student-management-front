import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { StudentsComponent } from './components/students/students.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { LoadStudentsComponent } from './components/load-students/load-students.component';
import { LoadPaymentsComponent } from './components/load-payments/load-payments.component';
import { AdminTemplateComponent } from './components/admin-template/admin-template.component';
import { AuthUserGuard } from './guards/auth-user.guard';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { NewPaymentComponent } from './components/new-payment/new-payment.component';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminTemplateComponent,
    canActivate: [AuthUserGuard],
    data: { roles: ['USER', 'MANAGER', 'ADMIN'] },
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['USER', 'MANAGER', 'ADMIN'] },
      },
      { path: 'profile', component: ProfileComponent },
      {
        path: 'students',
        canActivate: [AuthUserGuard],
        component: StudentsComponent,
        data: { roles: ['USER', 'MANAGER', 'ADMIN'] },
      },
      {
        path: 'payments',
        canActivate: [AuthUserGuard],
        component: PaymentsComponent,
        data: { roles: ['MANAGER', 'ADMIN'] },
      },
      {
        path: 'student-details/:code',
        component: StudentDetailsComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
      },
      {
        path: 'new-payment/:studentCode',
        component: NewPaymentComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
      },
      {
        path: 'payment-details/:id',
        component: PaymentDetailsComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'loadStudents',
        component: LoadStudentsComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'loadPayments',
        component: LoadPaymentsComponent,
        canActivate: [AuthUserGuard],
        data: { roles: ['ADMIN'] },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
