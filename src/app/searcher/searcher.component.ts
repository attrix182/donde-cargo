import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearcherService } from '../services/searcher.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';


@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss']
})
export class SearcherComponent implements AfterViewInit {
  @Input() error!: string;
  @ViewChild('inputAddress') inputAddress;

  results;

  address!: string;
  addressText!: string;
  geo;
  locationError = '';
  loading: boolean = false;

  tipoCombustible = [
    {
      id: 19,
      name: 'Diesel'
    },
    {
      id: 21,
      name: 'Diesel Premium'
    },
    {
      id: 6,
      name: 'GNC'
    },
    {
      id: 3,
      name: 'Nafta Premium'
    },
    {
      id: 2,
      name: 'Nafta Súper'
    }

  ]

  banderas = [
    {"id": 17, "name": "ASPRO"},
    {"id": 26, "name": "AXION"},
    {"id": 1, "name": "BLANCA"},
    {"id": 21, "name": "CAMUZZI GAS DEL SUR"},
    {"id": 6, "name": "DAPSA S.A."},
    {"id": 3, "name": "ESSO PETROLERA ARGENTINA S.R.L"},
    {"id": 29, "name": "GULF"},
    {"id": 24, "name": "OIL COMBUSTIBLES S.A."},
    {"id": 27, "name": "PAMPA ENERGIA"},
    {"id": 20, "name": "PETROBRAS"},
    {"id": 28, "name": "PUMA"},
    {"id": 8, "name": "REFINOR"},
    {"id": 4, "name": "SHELL C.A.P.S.A."},
    {"id": -1, "name": "SIN EMPRESA BANDERA"},
    {"id": 7, "name": "SOL PETROLEO"},
    {"id": 30, "name": "VOY"},
    {"id": 2, "name": "YPF"}
  ]

  banderasSeleccionadas: any[] = []


  tipoSeleccionado = this.tipoCombustible[4];
  banderasControl = new FormControl();
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  @ViewChild('banderaInput') banderaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete!: MatAutocomplete;

  constructor(private router: Router, private searcherSVC: SearcherService, private http: HttpClient) {}


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our bandera
    if ((value || '').trim()) {
      this.banderasSeleccionadas.push({ id: -1, name: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.banderasControl.setValue(null);
  }

  remove(bandera: any): void {
    const index = this.banderasSeleccionadas.indexOf(bandera);

    if (index >= 0) {
      this.banderasSeleccionadas.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.banderasSeleccionadas.push(event.option.value);
    this.banderaInput.nativeElement.value = '';
    this.banderasControl.setValue(null);
  }

  seleccionarCombustible(combustible) {
    if(combustible.id == this.tipoSeleccionado.id) return;
    this.tipoSeleccionado = combustible;
    this.results = [];
  }

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
      .getEmpresasAgrupadasBanderasCombustible([17, 26, 1, 21, 6, 3, 29, 24, 27, 20, 28, 8, 4, -1, 7, 30, 2], this.tipoSeleccionado.id, this.geo)
      .subscribe((res) => {
        console.log(res);
        this.results = res;
      });
  }
}
