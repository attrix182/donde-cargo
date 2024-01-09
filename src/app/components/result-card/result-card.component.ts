import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LOGOS } from 'src/app/constantes/logos';

interface EmpresaCombustible {
  idempresa: number;
  idempresabandera: number;
  empresabandera: string;
  razonsocial: string;
  lat: string;
  lon: string;
  cuit: string;
  localidad: string;
  provincia: string;
  direccion: string;
  precios: { [idProducto: string]: PrecioProducto };
  img?:any;
}

interface PrecioProducto {
  idproducto: number;
  idempresa: number;
  precio: number;
  idtipohorario: number;
  fechavigencia: string;
  tipohorario: string;
}

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrls: ['./result-card.component.scss'],
})
export class ResultCardComponent implements OnInit {

  @Input() result: EmpresaCombustible;

  urlAPI = '	https://preciosensurtidor.minem.gob.ar/'

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(){
    this.getLogoURL()
  }

  getPrecios(precios: { [idProducto: string]: PrecioProducto }): PrecioProducto[] {
    return Object.values(precios);
  }

  getLogoURL(){
    this.result.img =   this.sanitizer.bypassSecurityTrustResourceUrl(this.urlAPI + LOGOS[this.result.idempresabandera]);
  }

  getDirections(){

  }
 }
