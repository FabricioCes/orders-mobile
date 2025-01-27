export const generateTableRows = (tables: number[], columns: number) => {
    const rows = [];
    for (let i = 0; i < tables.length; i += columns) {
      rows.push(tables.slice(i, i + columns));
    }
    return rows;
  };