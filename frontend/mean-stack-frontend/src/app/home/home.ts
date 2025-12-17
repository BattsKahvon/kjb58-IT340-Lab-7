import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  message: string = '';

  isLoginPopupVisible = false;
  isRegisterPopupVisible = false;

  isLoggedIn = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {

    // Restore auth state
    this.isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    // Backend connectivity test
    this.api.getMessage().subscribe({
      next: (res) => {
        this.message = res.message || 'No message';
      },
      error: () => {
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
      alert('All fields required.');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match!');
      return;
    }

    this.api.registerUser({ username, email, password }).subscribe({
      next: () => {
        alert('Registration successful!');
        this.closeRegisterPopup();
      },
      error: () => {
        alert('Registration failed.');
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
      alert('Both fields required.');
      return;
    }

    this.api.loginUser({ username, password }).subscribe({
      next: () => {
        this.isLoggedIn = true;

        // ✅ AUTH FLAGS
        localStorage.setItem('loggedIn', 'true');
        localStorage.removeItem('isGuest');

        this.closeLoginPopup();
        this.router.navigate(['/map']);
      },
      error: () => {
        alert('Invalid username or password.');
      }
    });
  }

// --------------------------
// NAVIGATION
// --------------------------
goToMap() {
  this.router.navigate(['/map']);
}

  // --------------------------
  // ✅ GUEST EXPLORE
  // --------------------------
  exploreAsGuest() {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/map']);
  }

  // --------------------------
  // LOGOUT
  // --------------------------
  logoutUser() {
    this.isLoggedIn = false;
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('isGuest');
    this.router.navigate(['/']);
  }

  // --------------------------
  // POPUP LOGIC
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

    if (
      this.findMatchingButton(el, '.login-nav-button') ||
      this.findMatchingButton(el, '.login-cta')
    ) {
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
