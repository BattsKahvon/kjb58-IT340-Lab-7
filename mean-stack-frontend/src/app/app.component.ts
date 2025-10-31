import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  template: `<h1>{{ message }}</h1>`,
})
export class AppComponent implements OnInit {
  message: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getMessage().subscribe((data: any) => {
      this.message = data;
    });
  }
}
