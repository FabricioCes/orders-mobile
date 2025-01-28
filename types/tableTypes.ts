export type TableRowProps = {
    tables: number[];
    isActive: (tableId: number) => boolean;
    onTablePress: (tableId: number) => void;
    rowIndex: number;
    totalColumns: number;
    accessibilityLabel?: string;
  };