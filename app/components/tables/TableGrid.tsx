// TableGrid.tsx
import React, { useCallback, useMemo } from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import TableRow from "./TableRow";
import { generateTableRows } from "@/utils/tableUtils";

type TableGridProps = {
  tables: number[];
  columns: number;
  isActive: (tableId: number) => boolean;
  onTablePress: (tableId: number) => void;
  place?: string;
};

const TableGrid = React.memo(
  ({
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

    const renderRow = useCallback(
      ({ item: row, index }: { item: number[]; index: number }) => (
        <TableRow
          key={`${place}-row-${index}`}
          place={place}
          tables={row}
          isActive={isActive}
          onTablePress={onTablePress}
          rowIndex={index}
          totalColumns={columns}
        />
      ),
      [columns, isActive, onTablePress, place]
    );

    if (!rows.length) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-lg">
            No hay mesas disponibles
          </Text>
        </View>
      );
    }

    return (
      <FlashList
        data={rows}
        renderItem={renderRow}
        keyExtractor={(_, index) => `${place}-row-${index}`}
        estimatedItemSize={120}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 10,
        }}
        testID="table-grid-scrollview"
        horizontal={false}
      />
    );
  }
);

export default TableGrid;
