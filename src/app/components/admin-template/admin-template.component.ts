import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: ['./admin-template.component.css'],
})
export class AdminTemplateComponent implements OnInit {
  username: string | null = null;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Obtenir le 'subject' du token JWT
    this.username = this.authService.getSubjectFromToken();
  }

  logout() {
    this.authService.logout();
  }
}
