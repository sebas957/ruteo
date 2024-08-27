import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import {
  NbMediaBreakpointsService,
  NbMenuService,
  NbSidebarService,
  NbThemeService,
} from "@nebular/theme";
import { UserData } from "../../../@core/data/users";
import { LayoutService } from "../../../@core/utils";
import { map, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { AuthService } from "../../../modulos/auth/servicios/auth.service";
import { Store } from "@ngrx/store";
import { obtenerUsuarioNombreCorto } from "../../../redux/selectos/usuario.selector";
import { obtenerContenedorSeleccion } from "../../../redux/selectos/contenedor.selectors";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: "ngx-header",
  styleUrls: ["./header.component.scss"],
  templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  usuarioNombreCorto$ = this.store.select(obtenerUsuarioNombreCorto);
  usuarioNombreCorto = "";
  iconoMenuVisible$ = this.store.select(obtenerContenedorSeleccion);

  themes = [
    { value: "default", name: "Light" },
    { value: "dark", name: "Dark" },
    { value: "cosmic", name: "Cosmic" },
    { value: "corporate", name: "Corporate" },
  ];

  currentTheme = "default";

  userMenu = [{ title: "Perfil" }, { title: "Contenedores" }, { title: "Cerrar sesión" }];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private userService: UserData,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    private authService: AuthService,
    private store: Store
  ) {}

  ngOnInit() {
    this.usuarioNombreCorto$.subscribe((nombre: any) => (this.usuarioNombreCorto = nombre));
    this.currentTheme = this.themeService.currentTheme;

    this.userService.getUsers().pipe(takeUntil(this.destroy$)).subscribe((users: any) => (this.user = users.nick));

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, currentBreakpoint]) => currentBreakpoint.width < xl), takeUntil(this.destroy$))
      .subscribe((isLessThanXl: boolean) => (this.userPictureOnly = isLessThanXl));

    this.themeService.onThemeChange()
      .pipe(map(({ name }) => name), takeUntil(this.destroy$))
      .subscribe((themeName) => (this.currentTheme = themeName));

    // Suscribirse a los eventos de navegación para actualizar el menú según la ruta
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateMenu();
        }
      });

    this.menuService.onItemClick().subscribe((evento) => {
      switch (evento.item.title) {
        case "Cerrar sesión":
          this.authService.logout();
          break;
        case "Contenedores":
          this.router.navigate(['/contenedor/lista']);
          break;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, "menu-sidebar");
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  updateMenu() {
    const currentUrl = this.router.url;

    // Restablecer el menú a su estado original
    this.userMenu = [{ title: "Perfil" }, { title: "Contenedores" }, { title: "Cerrar sesión" }];

    // Si estamos en la ruta /contenedor/lista, eliminamos el ítem de "Contenedores"
    if (currentUrl === '/contenedor/lista') {
      this.userMenu = this.userMenu.filter(item => item.title !== 'Contenedores');
    }
  }
}
