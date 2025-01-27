import React from 'react';
import { ScrollView } from 'react-native';
import TableRow from './TableRow';
import { generateTableRows } from '@/utils/tableUtils';

type TableGridProps = {
  tables: number[];
  columns: number;
  isActive: (tableId: number) => boolean;
  onTablePress: (tableId: number) => void;
};

const TableGrid = ({ tables, columns, isActive, onTablePress }: TableGridProps) => (
  <ScrollView contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
    {generateTableRows(tables, columns).map((row, rowIndex) => (
      <TableRow
        key={rowIndex}
        tables={row}
        isActive={isActive}
        onTablePress={onTablePress}
      />
    ))}
  </ScrollView>
);

export default TableGrid