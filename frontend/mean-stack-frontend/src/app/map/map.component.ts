import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  // 🔹 TEMP business data (will come from backend later)
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

  ngAfterViewInit(): void {
    const mapDiv = document.getElementById('map');

    if (!mapDiv || typeof google === 'undefined') return;

    const map = new google.maps.Map(mapDiv, {
      center: { lat: 40.7446, lng: -74.1802 }, // Newark
      zoom: 14
    });

    // 🔹 Add markers
    this.businesses.forEach(business => {

      const marker = new google.maps.Marker({
        position: { lat: business.lat, lng: business.lng },
        map,
        title: business.name,
        icon: business.verified
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <strong>${business.name}</strong><br/>
          Category: ${business.category}<br/>
          Status: ${business.verified ? 'Verified' : 'User Submitted'}
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }
}
