import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpService } from "../../../comun/servicios/http.service";
import { ParametrosConsulta, RespuestaGeneralLista } from "@/interfaces/general/general.interface";
import { AutocompletarCiudades, RespuestaAutocompletar } from "@/interfaces/comun/autocompletar.interface";
import { RespuestaContacto } from "@/interfaces/contacto/contacto.interface";

@Injectable({
  providedIn: "root",
})
export class ContactoService {
  constructor(private http: HttpService) {}

  lista(parametros: ParametrosConsulta) {
    return this.http.post<RespuestaGeneralLista<RespuestaContacto>>(
      `general/funcionalidad/lista/`,
      parametros
    );
  }

  listaAutocompletar<T>(modelo:string) {
    return this.http.post<RespuestaAutocompletar<T>>(
      "general/funcionalidad/autocompletar/",
      {
        filtros: [
          {
            id: "1692284537644-1688",
            operador: "__icontains",
            propiedad: "nombre__icontains",
            valor1: ``,
            valor2: "",
          },
        ],
        limite: 0,
        desplazar: 0,
        ordenamientos: [],
        limite_conteo: 10000,
        modelo,
      }
    );
  }

  listaCiudades(arrFiltros: ParametrosConsulta) {
    return this.http.post<RespuestaAutocompletar<AutocompletarCiudades>>(
      "general/funcionalidad/autocompletar/",
      arrFiltros
    );
  }

  guardarContacto(data: any) {
    return this.http.post<RespuestaContacto>(`general/contacto/`, data);
  }
}
