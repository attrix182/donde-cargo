import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearcherService } from '../services/searcher.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss']
})
export class SearcherComponent implements AfterViewInit {
  @Input() error!: string;
  @ViewChild('inputAddress') inputAddress;

  combustibles;

  searchValue!: string;
  address!: string;
  addressText!: string;
  geo;
  locationError = '';
  loading: boolean = false;

  constructor(private router: Router, private searcherSVC: SearcherService, private http: HttpClient) {}

  getAddress() {
    this.loading = true;
    this.searcherSVC.geocodeAddress(this.address).subscribe({
      next: (res) => {
        this.geo = res[0];
        this.searcherSVC.setGeo(this.geo);
        this.searcherSVC.getNameAddress(this.geo.lat, this.geo.lon).subscribe((res) => {
          this.addressText = res.display_name;

          this.loading = false;
        });
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    }

    );
  }

  getLocalAddress() {
    if (navigator.geolocation) {
      this.loading = true;
      navigator.geolocation.getCurrentPosition((position) => {
        this.geo = { lat: position.coords.latitude, lon: position.coords.longitude };
        this.searcherSVC.setGeo(this.geo);
        this.searcherSVC.getNameAddress(this.geo.lat, this.geo.lon).subscribe(
          (res) => {
            this.addressText = res.display_name;

            this.loading = false;
          },
          (error) => {
            this.loading = false;
            console.log(error.message);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                this.locationError = 'No otorgaste permisos de ubicación a la web, configuralo desde tu navegador.';
                break;
              case error.POSITION_UNAVAILABLE:
                this.locationError = 'Ubicacion no disponible.';
                break;
              case error.TIMEOUT:
                // Se ha excedido el tiempo para obtener la ubicación.
                break;
            }
          }
        );
      });
    }
  }

  ngAfterViewInit() {
    this.geo = this.searcherSVC.getStoredGeo();
    if (this.geo) {
      this.searcherSVC.getNameAddress(this.geo.lat, this.geo.lon).subscribe((res) => {
        this.addressText = res.display_name;

      });
    } else {
      this.getLocalAddress();
    }
  }



  search() {
    this.searcherSVC
      .getEmpresasAgrupadasBanderasCombustible(['2', '4'], 2, this.geo)
      .subscribe((res) => {
        console.log(res);
        this.combustibles = res;
      });
  }
}
