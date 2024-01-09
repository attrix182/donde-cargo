import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearcherService {

  geo: BehaviorSubject<any> = new BehaviorSubject<any>({});

  apiUrl = 'https://preciosensurtidor.minem.gob.ar/ws/rest/rest/server.php';
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


  getEmpresasAgrupadasBanderasCombustible(banderas, combustible, geo) {
    const headers = new HttpHeaders({
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'es-US,es;q=0.9,en-US;q=0.8,en;q=0.7,es-419;q=0.6',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      // Agrega aquí todas las demás cabeceras necesarias
    });



    const data = {
      method: 'getEmpresasAgrupadasBanderasCombustible',
      banderas: banderas,
      combustible: combustible,
      bounds: this.generarBoundingBox(geo.lat, geo.lon, 5)
    };

    console.log(data);

    return this.http.post(this.apiUrl, this.transformRequest(data), { headers })

  }

  generarBoundingBox(latitud, longitud, distanciaEnKm) {
    // Convertir la distancia de kilómetros a grados (aproximadamente)
    const distanciaEnGrados = distanciaEnKm / 111.32;

    // Calcular las coordenadas del cuadro delimitador
    const so = {
      lat: latitud - distanciaEnGrados,
      lng: longitud - distanciaEnGrados
    };

    const neLAT = (latitud + distanciaEnGrados).toString();
    const neLNG = (longitud + distanciaEnGrados).toString();

    const ne = {
      lat: parseInt(neLAT.split('.')[0] + '.' + neLAT.split('.')[1]),
      lng: parseInt(neLNG.split('.')[0] + '.' + neLNG.split('.')[1])
    };

    return { so, ne };
  }

  private transformRequest(obj): string {
    const formData = new URLSearchParams();

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key == 'method') {
          formData.set(key, obj[key]);
        } else {
          formData.set(key, JSON.stringify(obj[key]));
        }
      }
    }

    return formData.toString();
  }

}
