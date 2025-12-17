import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

declare const google: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  // --------------------------
  // AUTH STATE
  // --------------------------
  isLoggedIn = false;
  isGuest = false;

  // --------------------------
  // MAP STATE
  // --------------------------
  map: any;
  markers: any[] = [];

  // --------------------------
  // UI STATE
  // --------------------------
  sidebarOpen = true;
  showAddPopup = false;
  showUpdatePopup = false;
  showDeletePopup = false;
  selectedBusinessIndex = 0;
  selectedUpdateIndex = 0;

  // --------------------------
  // SEARCH STATE (NAME ONLY)
  // --------------------------
  searchQuery = '';
  filteredBusinesses: any[] = [];

  // --------------------------
  // BUSINESS DATA (FROM BACKEND)
  // --------------------------
  businesses: any[] = [];

  // --------------------------
  // NEW BUSINESS FORM MODEL
  // --------------------------
  newBusiness = {
    name: '',
    address: '',
    category: '',
    verified: false,
    hours: '',
    contact: ''
  };

  // --------------------------
  // UPDATE BUSINESS FORM MODEL
  // --------------------------
  updateForm = {
    hours: '',
    contact: ''
  };

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  // --------------------------
  // 🔐 AUTH SYNC (KEY FIX)
  // --------------------------
  syncAuthState() {
    this.isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    // If user is NOT logged in, we treat them as guest
    // (even if localStorage flag is missing) so the guest button never disappears.
    const storedGuest = localStorage.getItem('isGuest') === 'true';
    this.isGuest = !this.isLoggedIn && (storedGuest || true);

    // Optional: keep localStorage consistent
    if (!this.isLoggedIn) localStorage.setItem('isGuest', 'true');
    if (this.isLoggedIn) localStorage.removeItem('isGuest');
  }

  // --------------------------
  // INIT MAP + AUTH STATE + LOAD BUSINESSES
  // --------------------------
  ngAfterViewInit(): void {
    this.syncAuthState();

    const mapDiv = document.getElementById('map');
    if (!mapDiv || typeof google === 'undefined') return;

    this.map = new google.maps.Map(mapDiv, {
      center: { lat: 40.7446, lng: -74.1802 }, // Newark
      zoom: 14,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] }
      ]
    });

    // 🔹 Load businesses from backend
    this.api.getBusinesses().subscribe({
      next: (data) => {
        this.businesses = data;
        this.filteredBusinesses = [...this.businesses];
        this.renderMarkers();
      },
      error: (err) => {
        console.error('Failed to load businesses', err);
        alert('Could not load businesses from backend');
      }
    });
  }

  // --------------------------
  // MARKER RENDERING (WITH HOVER INFO)
  // --------------------------
  renderMarkers() {
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    this.filteredBusinesses.forEach(b => {

      const marker = new google.maps.Marker({
        position: { lat: b.lat, lng: b.lng },
        map: this.map,
        title: b.name,
        icon: b.verified
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-size:13px">
            <strong>${b.name}</strong><br/>
            ${b.hours || ''}<br/>
            ${b.contact || ''}<br/>
            <span style="color:${b.verified ? '#166534' : '#6b7280'}">
              ${b.verified ? 'Verified Business' : 'User Submitted'}
            </span>
          </div>
        `
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(this.map, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      this.markers.push(marker);
    });
  }

  // --------------------------
  // SEARCH (NAME ONLY)
  // --------------------------
  filterBusinesses() {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredBusinesses = [...this.businesses];
    } else {
      this.filteredBusinesses = this.businesses.filter(b =>
        (b.name || '').toLowerCase().includes(query)
      );
    }

    this.renderMarkers();
  }

  // --------------------------
  // ADDRESS → COORDS
  // --------------------------
  geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(status);
        }
      });
    });
  }

  // --------------------------
  // SIDEBAR / POPUPS (LOGGED-IN ONLY)
  // --------------------------
  openAddPopup() {
    if (!this.isLoggedIn) return;
    this.showAddPopup = true;
  }

  openUpdatePopup() {
    if (!this.isLoggedIn) return;

    const b = this.businesses[this.selectedUpdateIndex];
    if (!b) {
      alert('No business selected.');
      return;
    }

    this.updateForm.hours = b.hours || '';
    this.updateForm.contact = b.contact || '';
    this.showUpdatePopup = true;
  }

  openDeletePopup() {
    if (!this.isLoggedIn) return;
    this.showDeletePopup = true;
  }

  closePopups() {
    this.showAddPopup = false;
    this.showUpdatePopup = false;
    this.showDeletePopup = false;
  }

  // --------------------------
  // SIDEBAR TOGGLE (EVERYONE)
  // --------------------------
  toggleSidebar() {
    this.syncAuthState(); // ✅ refresh state so guest login button never disappears

    this.sidebarOpen = !this.sidebarOpen;

    const mapDiv = document.getElementById('map');
    if (mapDiv) {
      mapDiv.style.marginLeft = this.sidebarOpen ? '220px' : '0';
      mapDiv.style.width = this.sidebarOpen ? 'calc(100% - 220px)' : '100%';
    }

    if (this.map) {
      setTimeout(() => {
        google.maps.event.trigger(this.map, 'resize');
      }, 300);
    }
  }

  // --------------------------
  // ADD BUSINESS (BACKEND)
  // --------------------------
  async addBusiness() {
    if (!this.isLoggedIn) return;

    if (!this.newBusiness.name || !this.newBusiness.address) {
      alert('Name and address are required');
      return;
    }

    try {
      const coords = await this.geocodeAddress(
        this.newBusiness.address + ', Newark, NJ'
      );

      const payload = {
        name: this.newBusiness.name,
        category: this.newBusiness.category,
        address: this.newBusiness.address,
        lat: coords.lat,
        lng: coords.lng,
        verified: this.newBusiness.verified,
        hours: this.newBusiness.hours,
        contact: this.newBusiness.contact
      };

      this.api.addBusiness(payload).subscribe({
        next: (saved) => {
          this.businesses.push(saved);
          this.filterBusinesses();
          this.closePopups();
        },
        error: (err) => {
          console.error('Add business failed', err);
          alert('Failed to save business.');
        }
      });

      this.newBusiness = {
        name: '',
        address: '',
        category: '',
        verified: false,
        hours: '',
        contact: ''
      };

    } catch {
      alert('Could not find that address.');
    }
  }

  // --------------------------
  // UPDATE BUSINESS (BACKEND)
  // --------------------------
  updateBusiness() {
    if (!this.isLoggedIn) return;

    const b = this.businesses[this.selectedUpdateIndex];
    if (!b || !b._id) {
      alert('No business selected.');
      return;
    }

    this.api.updateBusiness(b._id, this.updateForm).subscribe({
      next: (updated) => {
        this.businesses[this.selectedUpdateIndex] = updated;
        this.filterBusinesses();
        this.closePopups();
      },
      error: (err) => {
        console.error('Update business failed', err);
        alert('Failed to update business.');
      }
    });
  }

  // --------------------------
  // DELETE BUSINESS (BACKEND)
  // --------------------------
  deleteBusiness() {
    if (!this.isLoggedIn) return;

    const b = this.businesses[this.selectedBusinessIndex];
    if (!b || !b._id) {
      alert('No business selected.');
      return;
    }

    this.api.deleteBusiness(b._id).subscribe({
      next: () => {
        this.businesses.splice(this.selectedBusinessIndex, 1);
        this.filterBusinesses();
        this.closePopups();
      },
      error: (err) => {
        console.error('Delete business failed', err);
        alert('Failed to delete business.');
      }
    });
  }

  // --------------------------
  // GUEST → LOGIN
  // --------------------------
  goToLogin() {
    // keep guest flag consistent: they’re leaving map to login
    localStorage.removeItem('isGuest');
    this.syncAuthState();
    this.router.navigate(['/']);
  }

  // --------------------------
  // LOGOUT
  // --------------------------
  logout() {
    localStorage.removeItem('loggedIn');
    localStorage.setItem('isGuest', 'true'); // go back to guest default
    this.syncAuthState();
    this.router.navigate(['/']);
  }
}
