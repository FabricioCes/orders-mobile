import React from "react";
import { View, useWindowDimensions } from "react-native";
import TableGrid from "./tables/TableGrid";
import { useTableNavigation } from "@/hooks/useTableNavigation";

type TablesProps = {
  qty: number;
  place: string;
};

export default function Tables({ qty, place }: TablesProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;
  const tables = Array.from({ length: qty }, (_, i) => i + 1);

  const { handleTablePress, isTableActive } = useTableNavigation(place);

  return (
    <View className="container p-5 flex-row items-center justify-center">
      <TableGrid
        tables={tables}
        columns={columns}
        isActive={isTableActive}
        onTablePress={handleTablePress}
      />
    </View>
  );
}
