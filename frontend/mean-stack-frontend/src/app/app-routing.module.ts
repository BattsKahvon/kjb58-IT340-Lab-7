import { MapComponent } from './map/map.component';
import { AuthGuard } from './guards/auth.guard';

const routes = [
  {
    path: 'map',
    component: MapComponent,
    canActivate: [AuthGuard]
  }
];
