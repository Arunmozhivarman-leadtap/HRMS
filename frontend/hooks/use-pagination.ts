import { useState, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function usePagination(initialSize = 10) {
    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(initialSize)
    const [search, setSearch] = useState("")

    const debouncedSearch = useDebounce(search, 500)

    const onPageChange = useCallback((page: number) => setPageIndex(page), [])
    const onPageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setPageIndex(0)
    }, [])

    const onSearch = useCallback((value: string) => {
        setSearch(value)
        setPageIndex(0)
    }, [])

    return {
        pageIndex,
        pageSize,
        search: debouncedSearch,
        skip: pageIndex * pageSize,
        limit: pageSize,
        onPageChange,
        onPageSizeChange,
        onSearch,
    }
}
