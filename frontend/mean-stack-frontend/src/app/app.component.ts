import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isLoginPopupVisible: boolean = false;
  isRegisterPopupVisible: boolean = false;

  // Helper to match clicks on nested elements
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

    // Close button
    if (this.findMatchingButton(el, '.close-button')) {
      if (this.isLoginPopupVisible) this.closeLoginPopup();
      if (this.isRegisterPopupVisible) this.closeRegisterPopup();
      return;
    }

    // Login triggers
    if (this.findMatchingButton(el, '.login-nav-button') ||
        this.findMatchingButton(el, '.login-cta')) {
      this.openLoginPopup();
      return;
    }

    // Register trigger
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
