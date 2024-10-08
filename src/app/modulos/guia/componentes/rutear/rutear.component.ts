import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbListModule } from "@nebular/theme";
import { General } from "../../../../comun/clases/general";
import { GuiaService } from "../../servicios/guia.service";
import { mapeo } from "../../servicios/mapeo";
import { forkJoin } from "rxjs";
import { tap } from "rxjs/operators";
import { vehiculoService } from "../../../vehiculo/servicios/vehiculo.service";
import { GoogleMapsModule, MapInfoWindow, MapMarker } from "@angular/google-maps";
import { ParametrosConsulta } from "@/interfaces/general/general.interface";
import { Visita } from "@/interfaces/visita/visita.interface";
import { Vehiculo } from "@/interfaces/vehiculo/vehiculo.interface";

@Component({
  selector: "app-rutear",
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule, NbIconModule, NbListModule, GoogleMapsModule],
  templateUrl: "./rutear.component.html",
  styleUrls: ["./rutear.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutearComponent extends General implements OnInit {

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  constructor(private visitaService: GuiaService, private vehiculoService: vehiculoService) {
    super();
  }

  center: google.maps.LatLngLiteral = { lat: 6.200713725811437, lng: -75.58609508555918 };
  zoom = 11;
  markerPositions: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };
  directionsResults: google.maps.DirectionsResult | undefined;

  arrParametrosConsulta: ParametrosConsulta = {
    filtros: [],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: "RutVehiculo",
  };

  arrParametrosConsultaVisita: ParametrosConsulta = {
    filtros: [
      {"propiedad":"estado_despacho","valor1": false},
      {"propiedad": "decodificado", "valor1": true},
      {"propiedad": "decodificado_error", "valor1": false},
    ],
    limite: 50,
    desplazar: 0,
    ordenamientos: [],
    limite_conteo: 10000,
    modelo: "RutVisita",
  };

  arrVehiculos: Vehiculo[] = [];
  arrVisitas: Visita[];

  ngOnInit(): void {
    this.consultaLista()
    this.changeDetectorRef.detectChanges();
  }

  consultaLista() {
    forkJoin({
      vehiculos: this.vehiculoService.lista(this.arrParametrosConsulta),
      visitas: this.visitaService.lista(this.arrParametrosConsultaVisita) 
    }).pipe(
      tap(({ vehiculos, visitas }) => {
        visitas.forEach((punto) => {          
          this.addMarker({ lat: punto.latitud, lng: punto.longitud });
          this.changeDetectorRef.detectChanges();
        });
        this.arrVehiculos = vehiculos.registros;
        this.arrVisitas = visitas;
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe();    
  }

  rutear(){
    this.visitaService.rutear().subscribe(() => {
      this.consultaLista();
      this.alerta.mensajaExitoso(
        "Se ha ruteado correctamente correctamente",
        "Guardado con éxito."
      );
      this.router.navigate(['/trafico']);
    });
  }

  ordenar() {
    this.visitaService.ordenar().subscribe((respuesta: any) => {
      this.alerta.mensajaExitoso(
        "Se ha ordenado correctamente",
        "Guardado con éxito."
      );
    });
  }

  addMarker(position: google.maps.LatLngLiteral) {
    this.markerPositions.push(position);
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }
}
