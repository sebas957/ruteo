import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from "@angular/core";
import { General } from "../../../../comun/clases/general";
import { FormularioComponent } from "../formulario/formulario.component";
import { NbCardModule } from "@nebular/theme";
import { ContenedorService } from "../../servicios/contenedor.service";
import { of } from "rxjs";
import { catchError, finalize, switchMap, tap } from "rxjs/operators";
import { obtenerUsuarioId } from "../../../../redux/selectos/usuario.selector";
import { ContenedorFormulario, NuevoContenedorRespuesta } from "@/interfaces/contenedor/contenedor.interface";

@Component({
  selector: "app-nuevo",
  standalone: true,
  imports: [CommonModule, FormularioComponent, NbCardModule],
  templateUrl: "./nuevo.component.html",
  styleUrls: ["./nuevo.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoComponent extends General implements OnInit {
  private contenedorService = inject(ContenedorService);
  procesando = false;
  codigoUsuario = "";

  informacionContenedor: ContenedorFormulario = {
    nombre: "",
    subdominio: "",
    plan_id: 0,
    correo: "",
    telefono: "",
    reddoc: false,
    ruteo: true,
    usuario_id: "",
  };

  ngOnInit(): void {
    this.consultarInformacion();
  }

  consultarInformacion() {
    this.store.select(obtenerUsuarioId).subscribe((codigoUsuario) => {
      this.codigoUsuario = codigoUsuario;
    });
  }

  enviarFormulario(formulario: any) {
    this.procesando = true;
    this.contenedorService
      .consultarNombre(formulario.subdominio)
      .pipe(
        switchMap(({ validar }) => {
          if (validar) {
            return this.contenedorService.nuevo(formulario, this.codigoUsuario);
          }
          return of(null);
        }),
        tap((respuestaNuevo: NuevoContenedorRespuesta) => {
          if (respuestaNuevo.contenedor) {
            this.alerta.mensajaExitoso(
              "Se ha creado el contenedor exitosamente.",
              "Guardado con éxito."
            );
            this.router.navigate(["/contenedor/lista"]);
            this.procesando = false;
          }
        }),
        catchError(() => {
          this.procesando = false;
          this.changeDetectorRef.detectChanges();
          return of(null);
        })
      )
      .subscribe();
  }
}
