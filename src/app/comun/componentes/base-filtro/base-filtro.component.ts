import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { BaseFiltroFormularioComponent } from "../base-filtro-formulario/base-filtro-formulario.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { General } from "../../clases/general";
import {
  NbButtonModule,
  NbDatepickerModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbPopoverModule,
  NbSelectModule,
  NbWindowRef,
  NbWindowService,
} from "@nebular/theme";
import {
  CriteriosFiltro,
  criteriosFiltros,
} from "@/comun/constantes/criterios-filtros";
import { guiaMapeo } from "@/modulos/guia/guia-mapeo";
import { mapeoAvanzado } from "@/comun/constantes/mapeo-avanzado";
import { HttpService } from "@/comun/servicios/http.service";
import { KeysPipe } from "@/comun/pipe/keys.pipe";
import { SoloNumerosDirective } from "@/comun/directivas/solo-numeros.directive";
import { NbMomentDateModule } from "@nebular/moment";

interface FiltroPropiedades {
  nombre: string;
  campoTipo: string;
  visibleTabla: boolean;
  visibleFiltro: boolean;
  ordenable: boolean;
  esFk?: boolean;
  modeloFk?: string;
}

@Component({
  selector: "app-base-filtro",
  templateUrl: "./base-filtro.component.html",
  styleUrls: ["./base-filtro.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BaseFiltroFormularioComponent,
    NbButtonModule,
    NbSelectModule,
    NbInputModule,
    NbIconModule,
    NbFormFieldModule,
    KeysPipe,
    NbDatepickerModule,
    SoloNumerosDirective,
    NbMomentDateModule,
    NbPopoverModule
  ],
})
export class BaseFiltroComponent extends General implements OnInit {
  formularioItem: FormGroup;
  listaFiltros: any[] = [];
  arrPropiedadBusquedaAvanzada: FiltroPropiedades[] = [];
  formularioFiltrosModal: FormGroup;
  criteriosBusqueda: CriteriosFiltro[][] = [];
  criteriosBusquedaModal: CriteriosFiltro[][] = [];
  arrRegistroBusquedaAvanzada: any = [];
  indexBusquedaAvanzada: number;
  filtrosAplicados: any[] = [
    {
      propiedad: "",
      operador: "",
      valor1: "",
      valor2: "",
      visualizarBtnAgregarFiltro: true,
    },
  ];
  selectedItem: string | number | boolean = "";
  @Input() propiedades: FiltroPropiedades[];
  @ViewChild("modalFiltrosAvanzado") modalFiltrosAvanzado: TemplateRef<any>;
  @Input() persistirFiltros: boolean = true;
  @Output() emitirFiltros: EventEmitter<any> = new EventEmitter();
  private windowRef: NbWindowRef;
  nombreFiltro = ``;

  constructor(
    private formBuilder: FormBuilder,
    private windowService: NbWindowService,
    private httpService: HttpService
  ) {
    super();
  }

  abrirModalFiltrosAvanzados(index: number) {
    this.indexBusquedaAvanzada = index;
    const filtro = this.filtros.controls[index] as FormGroup;
    const tituloModal = filtro.get("modeloBusquedaAvanzada")?.value;
    this.initFormulularioModal();
    let posicion: keyof typeof mapeoAvanzado = tituloModal;
    this.arrPropiedadBusquedaAvanzada = mapeoAvanzado[posicion].filter(
      (propiedad) => propiedad.visibleFiltro === true
    );
    this.agregarNuevoFiltroModal();
    this.criteriosBusquedaModal = [];
    this.consultarLista([], tituloModal);
    this.windowRef = this.windowService.open(this.modalFiltrosAvanzado, {
      title: "Filtros avanzados",
      context: {
        tituloModal,
      },
    });
    this.changeDetectorRef.detectChanges();
  }

  cerrarModal(item: any) {
    const filtro = this.filtros.controls[
      this.indexBusquedaAvanzada
    ] as FormGroup;
    filtro.patchValue({
      valor1: Object.values(item)[0],
    });
    this.windowRef.close();
  }

  consultarLista(listaFiltros: any, modelo: string) {
    this.httpService
      .post<{
        cantidad_registros: number;
        registros: any[];
        propiedades: any[];
      }>("general/funcionalidad/lista/", {
        modelo,
        serializador: 'ListaBuscar',
        filtros: listaFiltros,
      })
      .subscribe((respuesta) => {
        this.arrRegistroBusquedaAvanzada = respuesta.registros;
        this.changeDetectorRef.detectChanges();
      });
  }

  agregarNuevoFiltroModal() {
    this.filtrosModal.push(
      this.formBuilder.group({
        propiedad: [""],
        operador: [""],
        valor1: ["", [Validators.required]],
        valor2: [""],
      })
    );
    this.changeDetectorRef.detectChanges();
  }

  initFormulularioModal() {
    this.formularioFiltrosModal = this.formBuilder.group({
      filtros: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.construirPropiedades();
    this.activatedRoute.queryParams.subscribe((parametro) => {
      let tipo = window.location.pathname.split("/")[1];
      this.nombreFiltro = `${tipo}_${localStorage
        .getItem("itemNombre")
        ?.toLowerCase()}`;
      const localStorageFiltro = localStorage.getItem(this.nombreFiltro);
      let filtrosParseados: [] | null = null

      if (localStorageFiltro) {
        filtrosParseados = JSON.parse(localStorageFiltro!);
      }

      if (filtrosParseados?.length) {
        this.filtrosAplicados = JSON.parse(localStorageFiltro!);
        this.formularioItem.reset();
        this.filtros.clear();
        this.filtrosAplicados.map((propiedad, index) => {
          this.filtros.push(this.crearControlFiltros(propiedad, index));
        });
      } else {
        this.formularioItem.reset();
        this.filtros.clear();
        this.filtrosAplicados = [
          {
            propiedad: "",
            operador: "",
            valor1: "",
            valor2: "",
            visualizarBtnAgregarFiltro: true,
          },
        ];
        this.filtros.push(this.crearControlFiltros(null, 0));
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  initForm() {
    this.formularioItem = this.formBuilder.group({
      filtros: this.formBuilder.array([]),
    });
  }

  seleccionarPropiedad(nombreCampo: string, index: number) {
    const propiedad = this.propiedades.find(
      (propiedad) => propiedad.nombre === nombreCampo
    );

    if (propiedad) {
      const resultadoCriterioFiltro = criteriosFiltros[propiedad.campoTipo];
      this.criteriosBusqueda[index] = resultadoCriterioFiltro;
      const filtroPorActualizar = this.filtros.controls[index] as FormGroup;

      resultadoCriterioFiltro.forEach((filtro) => {
        if (filtro.defecto) {
          setTimeout(() => {
            filtroPorActualizar.patchValue({
              tipo: propiedad.campoTipo,
              valor1: "",
              busquedaAvanzada: propiedad?.esFk ? "true" : "false",
              modeloBusquedaAvanzada: propiedad?.modeloFk || "",
              operador: filtro.valor,
            });
          }, 300);
        }
      });

      if (propiedad.campoTipo === "Booleano") {
        setTimeout(() => {
          filtroPorActualizar.patchValue({
            tipo: propiedad.campoTipo,
            valor1: null,
            operador: "",
          });
        }, 300);
      }

      let inputValor1Modal: HTMLInputElement | null = document.querySelector(
        "#inputValor1" + index
      );
      inputValor1Modal!.focus();

      this.changeDetectorRef.detectChanges();
    }
  }

  seleccionarPropiedadModal(nombreCampo: string, index: number) {
    const propiedad = this.arrPropiedadBusquedaAvanzada.find(
      (propiedad) =>
        propiedad.nombre.toUpperCase() === nombreCampo.toUpperCase()
    );
    if (propiedad) {
      const resultadoCriterioFiltro = criteriosFiltros[propiedad.campoTipo];
      const filtroPorActualizar = this.filtrosModal.controls[
        index
      ] as FormGroup;

      this.criteriosBusquedaModal[index] = resultadoCriterioFiltro;

      resultadoCriterioFiltro.forEach((filtro) => {
        if (filtro.defecto) {
          setTimeout(() => {
            filtroPorActualizar.patchValue({
              tipo: propiedad.campoTipo,
              valor1: "",
              busquedaAvanzada: propiedad?.esFk ? "true" : "false",
              modeloBusquedaAvanzada: propiedad?.modeloFk || "",
              operador: filtro.valor,
            });
          }, 300);
        }
      });

      if (propiedad.campoTipo === "Booleano") {
        setTimeout(() => {
          filtroPorActualizar.patchValue({
            tipo: propiedad.campoTipo,
            valor1: null,
            operador: "",
          });
        });
      }

      let inputValor1Modal: HTMLInputElement | null = document.querySelector(
        "#inputValor1Modal" + index
      );
      inputValor1Modal!.focus();
    }
  }

  eliminarFiltroModal(index: number) {
    if (this.filtrosModal.length > 1) {
      this.filtrosModal.removeAt(index);
    }
  }

  construirPropiedades() {
    this.propiedades = guiaMapeo.datos.filter(
      (dato) => dato.visibleFiltro === true
    );
  }

  esCampoInvalido(index: number, campo: string) {
    const filtro = this.filtros.at(index);
    if (filtro) {
      const campoControl = filtro.get(campo);
      if (campoControl) {
        return (
          campoControl.invalid && (campoControl.touched || campoControl.dirty)
        );
      }
    }
    return false;
  }

  get filtros() {
    return this.formularioItem.get("filtros") as FormArray;
  }

  get filtrosModal() {
    return this.formularioFiltrosModal.get("filtros") as FormArray;
  }

  private crearControlFiltros(propiedades: any | null, index: number) {
    let valor1 = "";
    let valor2 = "";
    let propiedad = "";
    let operador = "";
    let tipo = "";
    let busquedaAvanzada = "false";
    let modeloBusquedaAvanzada = "";
    if (propiedades) {
      valor1 = propiedades.valor1;
      valor2 = propiedades.valor2;
      propiedad = propiedades.propiedad;
      operador = propiedades.operador;
      tipo = propiedades.tipo;
      busquedaAvanzada = propiedades.busquedaAvanzada;
      modeloBusquedaAvanzada = propiedades.modeloBusquedaAvanzada;
      const resultadoCriterioFiltro = criteriosFiltros[propiedades.tipo];
      this.criteriosBusqueda[index] = resultadoCriterioFiltro;
    }
    return this.formBuilder.group({
      propiedad: [propiedad],
      operador: [operador],
      valor1: [valor1, [Validators.required]],
      valor2: [valor2],
      tipo: [tipo],
      busquedaAvanzada: [busquedaAvanzada],
      modeloBusquedaAvanzada: [modeloBusquedaAvanzada],
    });
  }

  agregarNuevoFiltro() {
    this.filtros.push(
      this.formBuilder.group({
        propiedad: [""],
        operador: [""],
        valor1: ["", [Validators.required]],
        valor2: [""],
        tipo: [""],
        busquedaAvanzada: ["false"],
        modeloBusquedaAvanzada: [""],
      })
    );
  }

  cargarCamposAlFormulario() {
    if (localStorage.getItem(this.nombreFiltro)) {
      this.filtrosAplicados = JSON.parse(
        localStorage.getItem(this.nombreFiltro)!
      );
      this.filtrosAplicados.map((propiedad, index) => {
        this.filtros.push(this.crearControlFiltros(propiedad, index));
      });
    } else {
      this.filtros.push(this.crearControlFiltros(null, 0));
    }
  }

  eliminarFiltro(index: number) {
    if (this.filtros.length > 1) {
      this.filtros.removeAt(index);
    }
  }

  eliminarFiltroLista(index: number) {
    if (this.filtros.length > 1) {
      this.filtros.removeAt(index);
    }
  }

  aplicarFiltro() {
    const filtros = this.formularioItem.value["filtros"];
    const listaFiltros: any[] = [];
    let hayFiltrosSinValores = false;
    let emitirValores = true;
    filtros.forEach((filtro: any) => {
      if (filtro.propiedad !== "") {
        if (filtro.valor1 === "") {
          hayFiltrosSinValores = true;
        } else {
          let nuevoFiltro = {};
          if (filtro.tipo === "Booleano") {
            nuevoFiltro = {
              ...filtro,
              ...{
                propiedad: `${filtro.propiedad}`,
                campo: filtro.propiedad,
                valor1: filtro.operador === "true" ? true : false,
              },
            };
          } else {
            let propiedad = filtro.propiedad;
            if (filtro.operador !== "igual") {
              propiedad = `${filtro.propiedad}${filtro.operador}`;
            }
            nuevoFiltro = {
              ...filtro,
              ...{
                propiedad,
                campo: filtro.propiedad,
              },
            };
          }
          listaFiltros.push(nuevoFiltro);
        }
      } else {
        emitirValores = false;
      }
    });

    if (hayFiltrosSinValores === false) {
      this.listaFiltros = listaFiltros;
      if (this.persistirFiltros) {
        localStorage.setItem(
          this.nombreFiltro,
          JSON.stringify(this.listaFiltros)
        );
      }
      if (emitirValores) {
        this.emitirFiltros.emit(this.listaFiltros);
      }
    } else {
      this.alerta.mensajeError(
        "Error en formulario filtros",
        "contiene campos vacios"
      );
    }
  }

  actualizarPropiedad(propiedad: any, index: number) {
    const filtroPorActualizar = this.filtros.controls[index] as FormGroup;
    filtroPorActualizar.patchValue({
      propiedad: propiedad.campo,
      tipo: propiedad.tipo,
      operador: "",
      valor1: null,
    });
    if (propiedad.tipo === "Booleano") {
      filtroPorActualizar.patchValue({
        valor1: null,
      });
    }
  }

  actualizarOperador(operador: string, index: number) {
    const filtroPorActualizar = this.filtros.controls[index] as FormGroup;
    filtroPorActualizar.patchValue({ operador: operador });
  }

  actualizarValor1(valor1: string, index: number) {
    const filtroPorActualizar = this.filtros.controls[index] as FormGroup;
    filtroPorActualizar.patchValue({ valor1 });
  }

  limpiarFormulario() {
    localStorage.removeItem(this.nombreFiltro);
    this.formularioItem.reset();
    this.filtros.clear();
    this.agregarNuevoFiltro();
    this.emitirFiltros.emit([]);
  }

  limpiarFormularioModal(modal: string) {
    this.formularioFiltrosModal.reset();
    this.filtrosModal.clear();
    this.agregarNuevoFiltroModal();
    this.criteriosBusquedaModal = [];
    this.consultarLista([], modal);
  }

  aplicarFiltroModal(modal: string) {
    const filtros = this.formularioFiltrosModal.value["filtros"];
    const listaFiltros: any[] = [];
    let hayFiltrosSinValores = false;
    let emitirValores = true;
    filtros.forEach((filtro: any) => {
      if (filtro.propiedad !== "") {
        if (filtro.valor1 === "") {
          hayFiltrosSinValores = true;
        } else {
          let nuevoFiltro = {};
          if (filtro.tipo === "Booleano") {
            nuevoFiltro = {
              ...filtro,
              ...{
                propiedad: `${filtro.propiedad}`,
                campo: filtro.propiedad,
                valor1: filtro.operador === "true" ? true : false,
              },
            };
          } else {
            let propiedad = filtro.propiedad;
            if (filtro.operador !== "igual") {
              propiedad = `${filtro.propiedad}${filtro.operador}`;
            }
            nuevoFiltro = {
              ...filtro,
              ...{
                propiedad,
                campo: filtro.propiedad,
              },
            };
          }
          listaFiltros.push(nuevoFiltro);
        }
      } else {
        emitirValores = false;
      }
    });
    if (hayFiltrosSinValores === false) {
      this.consultarLista(listaFiltros, modal);
    } else {
      this.alerta.mensajeError(
        "Error en formulario filtros",
        "contiene campos vacios"
      );
    }
  }

  generarIdUnico() {
    const timestamp = Date.now(); // Obtiene la marca de tiempo actual en milisegundos
    const numeroAleatorio = Math.floor(Math.random() * 10000); // Genera un número aleatorio entre 0 y 9999
    const idUnico = `${timestamp}-${numeroAleatorio}`; // Combina la marca de tiempo y el número aleatorio
    return idUnico;
  }
}
