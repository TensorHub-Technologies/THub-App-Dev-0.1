import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export const DEFAULT_ITEMS_PER_PAGE = 12

const InfiniteScrollTable = ({ limit, total, onLoadMore }) => {
    const [itemsPerPage] = useState(limit || DEFAULT_ITEMS_PER_PAGE)
    const [page, setPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)

    useEffect(() => {
        setTotalItems(total)
    }, [total])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            // when user reaches bottom
            if (scrollTop + windowHeight >= fullHeight - 100) {
                const nextPage = page + 1

                if ((nextPage - 1) * itemsPerPage < totalItems) {
                    setPage(nextPage)
                    onLoadMore(nextPage, itemsPerPage)
                }
            }
        }

        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, [page, itemsPerPage, totalItems, onLoadMore])

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant='body2'>
                Showing {page * itemsPerPage > totalItems ? totalItems : page * itemsPerPage} of {totalItems}
            </Typography>
        </Box>
    )
}

InfiniteScrollTable.propTypes = {
    onLoadMore: PropTypes.func.isRequired,
    limit: PropTypes.number,
    total: PropTypes.number
}

export default InfiniteScrollTable
