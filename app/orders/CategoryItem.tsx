import React, { useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

type CategoryItemProps = {
  categoryName: string;
  expandedCategory: string | null;
  toggleCategory: () => void;
  children: React.ReactNode;
};

const CategoryItem: React.FC<CategoryItemProps> = ({
  categoryName,
  expandedCategory,
  toggleCategory,
  children,
}) => {
  return (
    <View className="my-3">
      <TouchableOpacity onPress={toggleCategory}>
        <View className="flex-row items-center gap-5">
          <Text className="text-xl font-bold text-[#007BFF]">{categoryName}</Text>
          <FontAwesome
            name={expandedCategory === categoryName ? "caret-right" : "caret-down"}
            color="#007BFF"
            size={20}
          />
        </View>
      </TouchableOpacity>
      {expandedCategory === categoryName && children}
    </View>
  );
};

type SubCategoryItemProps = {
  subCategoryName: string;
  expandedSubCategory: string | null;
  toggleSubCategory: () => void;
  children: React.ReactNode;
};

const SubCategoryItem: React.FC<SubCategoryItemProps> = ({
  subCategoryName,
  expandedSubCategory,
  toggleSubCategory,
  children,
}) => {
  return (
    <View className="m-2">
      <TouchableOpacity onPress={toggleSubCategory}>
        <View className="flex-row items-center gap-5">
          <Text className="text-[#0056B3] min-w-[250px]">{subCategoryName}</Text>
          <FontAwesome
            name={expandedSubCategory === subCategoryName ? "caret-right" : "caret-down"}
            color="#0056B3"
            size={20}
          />
        </View>
      </TouchableOpacity>
      {expandedSubCategory === subCategoryName && children}
    </View>
  );
};

export default CategoryItem;
export { SubCategoryItem };
