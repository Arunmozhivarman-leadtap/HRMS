"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Search } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PaginationControls } from "@/components/shared/pagination-controls"

import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalCount?: number
    pageSize?: number
    pageIndex?: number
    onPageChange?: (page: number) => void
    onPageSizeChange?: (size: number) => void
    onSearch?: (value: string) => void
    searchPlaceholder?: string
    isLoading?: boolean
    showSearch?: boolean
    hasBorder?: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    totalCount = 0,
    pageSize = 10,
    pageIndex = 0,
    onPageChange,
    onPageSizeChange,
    onSearch,
    searchPlaceholder = "Search...",
    isLoading = false,
    showSearch = true,
    hasBorder = true,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pageSize),
    })

    return (
        <div className="space-y-4">
            {showSearch && (
                <div className="flex items-center w-full py-4">
                    <div className="relative w-[350px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            onChange={(event) => onSearch?.(event.target.value)}
                            className="w-full pl-9 h-10 bg-background border-input hover:bg-zinc-50/50 focus:bg-background transition-all"
                        />
                    </div>
                </div>
            )}
            <div className={cn("rounded-md bg-white", hasBorder ? "border" : "")}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {totalCount > pageSize && !isLoading && (
                <PaginationControls
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    )
}
