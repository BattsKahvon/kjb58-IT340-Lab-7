import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  // MAP STATE
  // --------------------------
  map: any;
  markers: any[] = [];

  // --------------------------
  // UI STATE
  // --------------------------
  sidebarOpen = true;
  showAddPopup = false;
  showDeletePopup = false;
  selectedBusinessIndex = 0;

  // --------------------------
  // SEARCH STATE (NAME ONLY)
  // --------------------------
  searchQuery = '';
  filteredBusinesses: any[] = [];

  // --------------------------
  // BUSINESS DATA (SOURCE OF TRUTH)
  // --------------------------
  businesses = [
    {
      name: "Hobby’s Delicatessen",
      lat: 40.7429,
      lng: -74.1725,
      category: "Restaurant",
      verified: true
    },
    {
      name: "Baraka City Hall",
      lat: 40.7357,
      lng: -74.1724,
      category: "Community",
      verified: true
    },
    {
      name: "Newark Symphony Hall",
      lat: 40.7413,
      lng: -74.1687,
      category: "Arts",
      verified: false
    }
  ];

  // --------------------------
  // NEW BUSINESS FORM MODEL
  // --------------------------
  newBusiness = {
    name: '',
    address: '',
    category: '',
    verified: false
  };

  constructor(private router: Router) {}

  // --------------------------
  // INIT MAP
  // --------------------------
  ngAfterViewInit(): void {
    const mapDiv = document.getElementById('map');

    if (!mapDiv || typeof google === 'undefined') return;

    this.map = new google.maps.Map(mapDiv, {
      center: { lat: 40.7446, lng: -74.1802 }, // Newark
      zoom: 14
    });

    // Initialize filtered list
    this.filteredBusinesses = [...this.businesses];
    this.renderMarkers();
  }

  // --------------------------
  // MARKER RENDERING
  // --------------------------
  renderMarkers() {
    // Clear old markers
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];

    // Render filtered businesses only
    this.filteredBusinesses.forEach(b => {
      const marker = new google.maps.Marker({
        position: { lat: b.lat, lng: b.lng },
        map: this.map,
        title: b.name,
        icon: b.verified
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
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
        b.name.toLowerCase().includes(query)
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
  // SIDEBAR / POPUPS
  // --------------------------
  openAddPopup() {
    this.showAddPopup = true;
  }

  openDeletePopup() {
    this.showDeletePopup = true;
  }

  closePopups() {
    this.showAddPopup = false;
    this.showDeletePopup = false;
  }

  toggleSidebar() {
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
  // ADD BUSINESS
  // --------------------------
  async addBusiness() {
    if (!this.newBusiness.name || !this.newBusiness.address) {
      alert('Name and address are required');
      return;
    }

    try {
      const coords = await this.geocodeAddress(
        this.newBusiness.address + ', Newark, NJ'
      );

      this.businesses.push({
        name: this.newBusiness.name,
        category: this.newBusiness.category,
        verified: this.newBusiness.verified,
        lat: coords.lat,
        lng: coords.lng
      });

      // Reset form
      this.newBusiness = {
        name: '',
        address: '',
        category: '',
        verified: false
      };

      this.closePopups();
      this.filterBusinesses(); // keep search in sync
    } catch {
      alert('Could not find that address.');
    }
  }

  // --------------------------
  // DELETE BUSINESS
  // --------------------------
  deleteBusiness() {
    this.businesses.splice(this.selectedBusinessIndex, 1);
    this.closePopups();
    this.filterBusinesses(); // keep search in sync
  }

  // --------------------------
  // LOGOUT
  // --------------------------
  logout() {
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/']);
  }
}

