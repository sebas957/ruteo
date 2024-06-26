import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { noRequiereToken } from "../../../comun/interceptores/token.interceptor";
import { environment } from "../../../../environments/environment";
import { TokenService } from "./token.service";
import { Router } from "@angular/router";
import { removeCookie } from "typescript-cookie";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // registro(parametros:any){
  //   return this.http.post<any>(`${environment.url_api}/usuario/registro`, parametros, {context: noRequiereToken()});
  // }

  registro(parametros: any) {
    return this.http.post<any>(
      `${environment.url_api}/seguridad/usuario/`,
      parametros,
      { context: noRequiereToken() }
    );
  }

  login(parametros: any) {
    return this.http.post<any>(
      `${environment.url_api}/seguridad/login/`,
      parametros,
      { context: noRequiereToken() }
    );
  }

  logout() {
    localStorage.clear();
    this.tokenService.eliminar();
    removeCookie("usuario", { path: "/" });
    removeCookie("contenedor", { path: "/" });
    window.location.href = "";
  }

  recuperarClave(email: string) {
    return this.http.post(
      `${environment.url_api}/seguridad/usuario/cambio-clave-solicitar/`,
      { username: email, accion: "clave" },
      { context: noRequiereToken() }
    );
  }
}
