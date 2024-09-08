import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private autService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: this.fb.control('admin@gmail.com'),
      password: this.fb.control('123456'),
    });
  }

  login() {
    let username = this.loginForm.value.username;
    let password = this.loginForm.value.password;
    this.autService.login(username, password).subscribe(
      (success) => {
        if (success) {
          this.router.navigateByUrl('/admin');
        } else {
          console.log('Login failed');
          this.router.navigateByUrl('/login');
        }
      },
      (error) => {
        console.error('An error occurred during login', error);
        this.router.navigateByUrl('/login');
      }
    );
  }
}
