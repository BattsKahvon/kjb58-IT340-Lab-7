import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- REQUIRED for *ngIf

@Component({
  selector: 'app-root',
  standalone: true, // <-- REQUIRED: Explicitly mark as standalone
  imports: [CommonModule], // <-- REQUIRED: Imports CommonModule for *ngIf

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // State variables to control the visibility of the popups
  isLoginPopupVisible: boolean = false;
  isRegisterPopupVisible: boolean = false;

  /**
   * Helper function to check if the clicked element (or any of its parents) 
   * matches a given selector. This handles clicks on text or inner elements.
   */
  private findMatchingButton(target: HTMLElement | null, selector: string): boolean {
    let currentElement: HTMLElement | null = target;
    // Iterate up the DOM tree until we reach the body or find a match
    while (currentElement) {
      if (currentElement.matches(selector)) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  // --- HostListener Decorators to Force Click Binding ---

  @HostListener('document:click', ['$event.target'])
  onClickHandler(targetElement: EventTarget | null) {
    // Safely cast the EventTarget to HTMLElement
    const element = targetElement as HTMLElement | null;
    
    if (!element) return; // Exit if element is null

    // Check for the Close button (priority 1)
    if (this.findMatchingButton(element, '.close-button')) {
      console.log('--- Close Button Matched! Closing active popup.');
      if (this.isLoginPopupVisible) {
        this.closeLoginPopup();
      } else if (this.isRegisterPopupVisible) {
        this.closeRegisterPopup();
      }
      return;
    }

    // Check for Login buttons (priority 2)
    if (this.findMatchingButton(element, '.login-nav-button') || this.findMatchingButton(element, '.login-cta')) {
      console.log('--- Login Button Matched! Opening login popup.');
      this.openLoginPopup();
      return;
    }
    
    // Check for Register button (priority 3)
    if (this.findMatchingButton(element, '.register-button')) {
      console.log('--- Register Button Matched! Opening registration popup.');
      this.openRegisterPopup();
      return;
    }
  }
  
  // --- Original Logic (now called by the HostListener methods) ---
  
  openLoginPopup() {
    this.isLoginPopupVisible = true;
    this.isRegisterPopupVisible = false; // Close other if open
  }

  closeLoginPopup() {
    this.isLoginPopupVisible = false;
  }

  openRegisterPopup() {
    this.isRegisterPopupVisible = true;
    this.isLoginPopupVisible = false; // Close other if open
  }

  closeRegisterPopup() {
    this.isRegisterPopupVisible = false;
  }
}
