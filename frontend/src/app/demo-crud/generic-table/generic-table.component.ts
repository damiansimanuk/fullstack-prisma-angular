import { Component, Input } from '@angular/core';
import { HeaderActionsDefinition, ColumnDefinition, ButtonDefinition } from './models';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})
export class GenericTableComponent<TRow = any> {
  @Input() public title = 'Generic Table';
  @Input() public headerActions: HeaderActionsDefinition[] = [];
  @Input() public columns: ColumnDefinition<TRow>[] = [];
  @Input() public data: TRow[] = [];
  @Input() public paginator = false;
  @Input() public virtualScroll = false;

  isDisabled(action: ButtonDefinition<TRow>, row: TRow): boolean {
    const disabled = action.disabled ?? false;

    if (typeof disabled === 'function') {
      return disabled(row);
    }

    return disabled;
  }

  isHidden(action: ButtonDefinition<TRow>, row: TRow): boolean {
    const hidden = action.hidden ?? false;

    if (typeof hidden === 'function') {
      return hidden(row);
    }

    return hidden;
  }

  STR(field: ColumnDefinition<TRow>['field']): string {
    return <string>field;
  }

  getColumnStyle(col: ColumnDefinition<TRow>): string {
    let minWidth = '';
    let maxWidth = '';
    let width = '';

    if (!!col.maxWidth) {
      maxWidth = `max-width: ${col.maxWidth}; `;
      width = `width: ${col.maxWidth}; `;
    }
    if (!!col.minWidth) {
      minWidth = `min-width: ${col.minWidth};`;
      width = `width: ${col.minWidth};`;
    }
    return `${minWidth} ${maxWidth} ${width} ${col.style ?? ''}`;
  }

  getActionClass(action: ButtonDefinition<TRow> | HeaderActionsDefinition): string {
    const severity = action.severity ? ' p-button-' + action.severity : '';
    const large = action.large ? ' p-speeddial-button toolbar-button' : '';

    if (!!action.icon) {
      return `mr-1 shadow-2 p-button-rounded ${action.class} ${severity} ${large}`;
    }
    return `mr-1 shadow-2 ${action.class} ${severity} ${large}`;
  }

  get hasTitle() {
    return !!this.title;
  }

  getValue(row: any, column: ColumnDefinition<TRow>) {
    return row[this.STR(column.field)] ?? null;
  }

  format(row: TRow, column: ColumnDefinition<TRow>) {
    const { format } = column;
    if (typeof format === 'function') {
      return format(row, column);
    } else {
      return this.getValue(row, column);
    }
  }
}
