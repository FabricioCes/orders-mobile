import React, { memo } from "react";
import { View } from "react-native";
import TableItem from "./TableItem";
import { TableRowProps } from "@/types/tableTypes";
const TableRow = memo(
  ({
    place,
    tables,
    isActive,
    onTablePress
  }: TableRowProps & { rowIndex: number; totalColumns: number }) => {
    return (
      <View
        className="flex-row justify-center mb-4" // Centrado horizontal
        style={{
          width: "100%", // Ocupar todo el ancho disponible
          paddingHorizontal: 8, // Padding lateral
           alignSelf: 'center' // Centrado horizontal
        }}
        accessibilityRole="list"
      >
        {tables.map((table) => (
          <TableItem
            place={place ?? ""}
            key={`${place}-${table}`}
            tableNumber={table}
            isActive={isActive(table)}
            onPress={onTablePress}
          />
        ))}
      </View>
    );
  }
);
TableRow.displayName = "TableRow";

export default TableRow;
