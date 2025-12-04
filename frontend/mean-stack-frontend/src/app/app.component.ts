import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  message: string = '';

  isLoginPopupVisible: boolean = false;
  isRegisterPopupVisible: boolean = false;

  constructor(private api: ApiService) {

    // Test backend connectivity
    this.api.getMessage().subscribe({
      next: (res) => {
        console.log('Backend says:', res);
        this.message = res.message || 'No message';
      },
      error: (err) => {
        console.error('Backend error:', err);
        this.message = 'Backend failed to connect';
      }
    });
  }

  // --------------------------
  // REGISTER
  // --------------------------
  registerUser() {
    const username = (document.getElementById('reg-username') as HTMLInputElement).value;
    const email = (document.getElementById('reg-email') as HTMLInputElement).value;
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;
    const confirm = (document.getElementById('reg-confirm-password') as HTMLInputElement).value;

    if (!username || !email || !password) {
      alert("All fields required.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    this.api.registerUser({ username, email, password }).subscribe({
      next: (res) => {
        console.log("REGISTER SUCCESS:", res);
        alert("Registration successful!");
        this.closeRegisterPopup();
      },
      error: (err) => {
        console.error("REGISTER ERROR:", err);
        alert("Registration failed.");
      }
    });
  }

  // --------------------------
  // LOGIN
  // --------------------------
  loginUser() {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (!username || !password) {
      alert("Both fields required.");
      return;
    }

    this.api.loginUser({ username, password }).subscribe({
      next: (res) => {
        console.log("LOGIN SUCCESS:", res);
        alert("Login successful!");
        this.closeLoginPopup();
      },
      error: (err) => {
        console.error("LOGIN ERROR:", err);
        alert("Invalid username or password.");
      }
    });
  }

  // --------------------------
  // Popup Logic
  // --------------------------

  private findMatchingButton(target: HTMLElement | null, selector: string): boolean {
    let current: HTMLElement | null = target;
    while (current) {
      if (current.matches(selector)) return true;
      current = current.parentElement;
    }
    return false;
  }

  @HostListener('document:click', ['$event.target'])
  onClickHandler(targetElement: EventTarget | null) {
    const el = targetElement as HTMLElement | null;
    if (!el) return;

    if (this.findMatchingButton(el, '.close-button')) {
      if (this.isLoginPopupVisible) this.closeLoginPopup();
      if (this.isRegisterPopupVisible) this.closeRegisterPopup();
      return;
    }

    if (this.findMatchingButton(el, '.login-nav-button') ||
        this.findMatchingButton(el, '.login-cta')) {
      this.openLoginPopup();
      return;
    }

    if (this.findMatchingButton(el, '.register-button')) {
      this.openRegisterPopup();
      return;
    }
  }

  openLoginPopup() {
    this.isLoginPopupVisible = true;
    this.isRegisterPopupVisible = false;
  }

  closeLoginPopup() {
    this.isLoginPopupVisible = false;
  }

  openRegisterPopup() {
    this.isRegisterPopupVisible = true;
    this.isLoginPopupVisible = false;
  }

  closeRegisterPopup() {
    this.isRegisterPopupVisible = false;
  }
}
