import { useMemo, useCallback, memo } from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import TableRow from "./TableRow"; // Ajusta la ruta según tu estructura
import { generateTableGridForZone } from "@/utils/tableUtils";
import { TableCount } from "@/types/tableTypes";

interface TableGridProps {
  tables: TableCount;
  columns: number;
  isActive: (tableId: number) => boolean;
  onTablePress: (tableId: number) => void;
  place: string;
}

const TableGrid = memo(
  ({ tables, columns, isActive, onTablePress, place = "comedor" }: TableGridProps) => {
    // Calculamos las filas solo cuando tables o columns cambian
    const grid = useMemo(() => {
      if (!tables) return [];
      return generateTableGridForZone(tables, columns, place);
    }, [tables, columns]);

    // Renderizamos cada fila de la tabla
    const renderRow = useCallback(
      ({ item: row, index }: { item: number[]; index: number }) => (
        <TableRow
          key={`${place}-row-${index}`}
          place={place}
          isActive={isActive}
          onTablePress={onTablePress}
          rowIndex={index}
          totalColumns={columns}
          tables={row}
        />
      ),
      [columns, isActive, onTablePress, place]
    );

    // Si no hay filas, mostramos un mensaje
    if (!grid.length) {
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
        data={grid}
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