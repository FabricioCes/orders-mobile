import React from 'react';
import { View } from 'react-native';
import TableItem from './TableItem';

type TableRowProps = {
  tables: number[];
  isActive: (tableId: number) => boolean;
  onTablePress: (tableId: number) => void;
};

const TableRow = ({ tables, isActive, onTablePress }: TableRowProps) => (
  <View className="flex flex-row justify-center mb-4">
    {tables.map((table) => (
      <TableItem
        key={table}
        tableNumber={table}
        isActive={isActive(table)}
        onPress={() => onTablePress(table)}
      />
    ))}
  </View>
);
export default TableRow;