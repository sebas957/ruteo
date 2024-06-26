import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbCardModule, NbInputModule } from '@nebular/theme';
import { VehicleMapComponent } from '../../../../comun/componentes/vehicle-map/vehicle-map.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbInputModule,
    NbCardModule,
    VehicleMapComponent,
    RouterModule
  ],
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioComponent {

  @Input() informacionVehiculo: any = [];

  formularioVehiculo  = new FormGroup({
    placa: new FormControl(
      this.informacionVehiculo.placa,
      Validators.compose([Validators.required])
    )
  })


  enviar(){

  }
 }
