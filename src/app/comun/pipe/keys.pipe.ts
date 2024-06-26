import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys', standalone: true, })
export class KeysPipe implements PipeTransform {
  transform(value: any, args?: any[]): any[] {
    if (!value) return [];
    return Object.keys(value);
  }
}