"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";

interface MetaData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: ColumnDef<T>[];
  data: T[];
  meta: MetaData;
  filters: {
    search?: string;
    sort?: string;
    direction?: "asc" | "desc";
    perPage?: number;
  };
  routeName: string; // Ej: "users.index"
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  meta,
  filters,
  routeName,
  searchPlaceholder = "Buscar...",
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState(filters.search || "");
  const [sorting, setSorting] = React.useState<SortingState>([
    filters.sort && filters.direction
      ? { id: filters.sort, desc: filters.direction === "desc" }
      : { id: "", desc: false },
  ]);
  const [loading, setLoading] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  // Buscar con debounce (para no disparar en cada tecla)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== filters.search) {
        setLoading(true);
        router.get(
          routeName,
          { ...filters, search, page: 1 },
          { preserveState: true, replace: true, onFinish: () => setLoading(false) }
        );
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  // Manejar ordenamiento desde el backend
  React.useEffect(() => {
    const sort = sorting[0];
    if (!sort?.id) return;

    const direction = sort.desc ? "desc" : "asc";
    if (filters.sort === sort.id && filters.direction === direction) return;

    setLoading(true);
    router.get(
      routeName,
      { ...filters, sort: sort.id, direction },
      { preserveState: true, replace: true, onFinish: () => setLoading(false) }
    );
  }, [sorting]);

  // Cambiar de página
  function handlePageChange(page: number) {
    if (page < 1 || page > meta.last_page) return;
    setLoading(true);
    router.get(
      routeName,
      { ...filters, page },
      { preserveState: true, replace: true, onFinish: () => setLoading(false) }
    );
  }

  // Cambiar cantidad por página
  function handlePerPageChange(size: number) {
    setLoading(true);
    router.get(
      routeName,
      { ...filters, perPage: size, page: 1 },
      { preserveState: true, replace: true, onFinish: () => setLoading(false) }
    );
  }

  return (
    <div>
      {/* Buscador */}
      <div className="mb-2 flex justify-end gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.id === filters.sort
                    ? filters.direction
                    : false;

                  return (
                    <TableHead
                      key={header.id}
                      className={`cursor-pointer select-none ${sorted ? "text-blue-600" : ""
                        }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="text-center block">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === "asc" && <ArrowUp size={14} />}
                        {sorted === "desc" && <ArrowDown size={14} />}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filas por página:</span>
          <select
            className="h-8 w-[70px] rounded border border-input bg-background px-2 text-sm"
            value={meta.per_page}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={meta.current_page === 1}>
            Primero
          </Button>

          <Button variant="outline" size="sm" onClick={() => handlePageChange(meta.current_page - 1)} disabled={meta.current_page === 1}>
            Anterior
          </Button>

          <span>
            Página {meta.current_page} de {meta.last_page}
          </span>

          <Button variant="outline" size="sm" onClick={() => handlePageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page}>
            Siguiente
          </Button>

          <Button variant="outline" size="sm" onClick={() => handlePageChange(meta.last_page)} disabled={meta.current_page === meta.last_page}>
            Último
          </Button>
        </div>
      </div>
    </div>
  );
}
