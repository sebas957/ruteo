import { Injectable } from "@angular/core";
import { HttpService } from "../../../comun/servicios/http.service";

@Injectable({
  providedIn: "root",
})
export class GuiaService {
  constructor(private http: HttpService) {}

  lista(parametros: any) {
    return this.http.get<any>(
      `ruteo/guia/`,
    );
  }

  guardarGuias(data: any){
    return this.http.post<any[]>(`ruteo/guia/`, data);
  }

  consultarDetalle(id: number) {
    return this.http.getDetalle<any>(`ruteo/guia/${id}/`);
  }

  importarGuias(data: any) {
    return this.http.post<any[]>(`ruteo/guia/importar/`, data);
  }

}