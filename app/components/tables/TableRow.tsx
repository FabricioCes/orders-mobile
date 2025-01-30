import React, { memo, useCallback } from "react";
import { View, Pressable, AccessibilityInfo } from "react-native";
import TableItem from "./TableItem";
import { TableRowProps } from "@/types/tableTypes";


const TableRow = memo(
  ({
    tables,
    isActive,
    onTablePress,
    rowIndex,
  }: TableRowProps & { rowIndex: number; totalColumns: number }) => {

    const handlePress = useCallback(
      (tableId: number) => {
        onTablePress(tableId);
        AccessibilityInfo.announceForAccessibility(
          `Mesa ${tableId} seleccionada`
        );
      },
      [onTablePress]
    );

    return (
        <View
          className="flex flex-row justify-center mb-4"
          accessibilityRole="list"
        >
          {tables.map((table) => (
            <Pressable
              key={`table-${table}-row-${rowIndex}`}
              accessible
              accessibilityLabel={`Mesa ${table}`}
              accessibilityRole="button"
              onPress={() => handlePress(table)}
              accessibilityState={{ selected: isActive(table) }}
            >
              <TableItem
                tableNumber={table}
                isActive={isActive(table)}
                testID={`table-item-${table}`}
              />
            </Pressable>
          ))}
        </View>
    );
  }
);

TableRow.displayName = "TableRow"; // Para mejor debugging en React DevTools

export default TableRow;
