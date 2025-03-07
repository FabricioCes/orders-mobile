// TableRow.tsx
import React, { memo } from "react";
import { View } from "react-native";
import TableItem from "./TableItem";
import { TableRowProps } from "@/types/tableTypes";

const TableRow = memo(({
  tables,
  isActive,
  onTablePress,
  rowIndex,
  totalColumns,
}: TableRowProps & { rowIndex: number; totalColumns: number }) => {
  const containerStyle = {
    marginHorizontal: Math.max(0, 8 - (totalColumns * 2)), // Espaciado dinámico
  };

  return (
    <View
      style={containerStyle}
      className="flex-row justify-around mb-4"
      accessibilityRole="list"
    >
      {tables.map((table) => (
        <TableItem
          key={`table-${table}`}
          tableNumber={table}
          isActive={isActive(table)}
          onPress={onTablePress}
        />
      ))}
    </View>
  );
});

TableRow.displayName = "TableRow";

export default TableRow;