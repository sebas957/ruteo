import { createFeatureSelector, createSelector } from '@ngrx/store';

const Usuario = createFeatureSelector<any>('usuario');

export const obtenerUsuarioNombreCorto = createSelector(
    Usuario,
    (Usuario) => `${Usuario.nombre_corto}`
)