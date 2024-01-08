import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearcherService {

  geo: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) {}

  getNameAddress(lat: number, lon: number) {
    {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

      return this.http.get<any>(url);
    }
  }

  getStoredGeo(){
    const geo = localStorage.getItem('geoDC');
    if (geo) {
      return JSON.parse(geo);
    }
  }

  geocodeAddress(address: any) {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(address);
    return this.http.get(url);
  }

  setGeo(geo: any) {
    localStorage.setItem('geoDC', JSON.stringify(geo));
    this.geo.next(geo);
  }

  getGeo() {
    if (!this.geo) this.getLocalAddress();
    return this.geo.asObservable();
  }

  getLocalAddress() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.geo.next({ lat: position.coords.latitude, lon: position.coords.longitude });
      });
    }
  }

}
