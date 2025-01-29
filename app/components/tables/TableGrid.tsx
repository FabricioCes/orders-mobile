import React, { useMemo } from "react";
import { ScrollView, View, Text } from "react-native";
import TableRow from "./TableRow";
import { generateTableRows } from "@/utils/tableUtils";

type TableGridProps = {
  tables: number[];
  columns: number;
  isActive: (tableId: number) => boolean;
  onTablePress: (tableId: number) => void;
  place?: string; // Nueva prop para mejor manejo de keys
};

const TableGrid = ({
  tables,
  columns,
  isActive,
  onTablePress,
  place = "comedor",
}: TableGridProps) => {
  const rows = useMemo(
    () => generateTableRows(tables, columns),
    [tables, columns]
  );

  if (!rows.length) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-lg">No hay mesas disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingVertical: 10 }}
      showsVerticalScrollIndicator={false}
      testID="table-grid-scrollview"
    >
      {rows.map((row, rowIndex) => (
        <TableRow
          key={getRowKey(place, rowIndex)}
          tables={row}
          isActive={isActive}
          onTablePress={onTablePress}
          rowIndex={rowIndex}
          totalColumns={columns}
        />
      ))}
    </ScrollView>
  );
};

const getRowKey = (place: string, rowIndex: number) =>
  `${place}-row-${rowIndex}`;

export default React.memo(TableGrid);
