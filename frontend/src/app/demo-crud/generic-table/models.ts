export type CellFormatFunction<T> = (row: T, column: ColumnDefinition<T>) => string;
export type ConditionBooleanFunction<T> = (row: T) => boolean;

export interface HeaderActionsDefinition {
  text: string;
  tooltip?: string;
  icon?: string;
  large?: boolean;
  class?: string;
  severity?: 'primary' | 'secondary' | 'tertiary';
  handler: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

export interface ButtonDefinition<TRow> {
  text: string;
  tooltip?: string;
  icon?: string;
  large?: boolean;
  class?: string;
  severity?: 'primary' | 'secondary' | 'tertiary';
  handler: (row?: TRow) => void;
  disabled?: boolean | ConditionBooleanFunction<TRow>;
  hidden?: boolean | ConditionBooleanFunction<TRow>;
}

export interface ColumnDefinition<TRow> {
  header: string;
  field: keyof TRow | 'actions' | 'FORMAT';
  format?: 'date' | 'datetime' | 'boolean' | CellFormatFunction<TRow>;
  class?: string;
  headerClass?: string;
  style?: string;
  minWidth?: string;
  maxWidth?: string;
  actions?: ButtonDefinition<TRow>[];
}
