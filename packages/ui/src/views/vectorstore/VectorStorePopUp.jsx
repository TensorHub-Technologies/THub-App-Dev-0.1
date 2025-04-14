import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { IconDatabaseImport, IconX } from '@tabler/icons'

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'
import VectorStoreDialog from './VectorStoreDialog'
import UpsertResultDialog from './UpsertResultDialog'

export const VectorStorePopUp = ({ chatflowid, isUpsertButtonEnabled }) => {
    const [open, setOpen] = useState(false)
    const [showExpandDialog, setShowExpandDialog] = useState(false)
    const [expandDialogProps, setExpandDialogProps] = useState({})
    const [showUpsertResultDialog, setShowUpsertResultDialog] = useState(false)
    const [upsertResultDialogProps, setUpsertResultDialogProps] = useState({})

    const anchorRef = useRef(null)
    const prevOpen = useRef(open)

    const handleToggle = () => {
        if (!isUpsertButtonEnabled) return

        setOpen((prevOpen) => !prevOpen)
        setExpandDialogProps({
            open: true,
            title: 'Upsert Vector Store',
            chatflowid
        })
        setShowExpandDialog(true)
    }

    useEffect(() => {
        if (prevOpen.current === true && open === false && anchorRef.current) {
            anchorRef.current.focus()
        }
        prevOpen.current = open
    }, [open, chatflowid])

    const fabStyles = {
        height: '34px',
        width: '34px',
        minHeight: '0px',
        marginRight: '16px',
        borderRadius: '8px',
        background: isUpsertButtonEnabled ? undefined : 'red',
        color: '#fff',
        cursor: isUpsertButtonEnabled ? 'pointer' : 'not-allowed',
        '&:hover': {
            background: isUpsertButtonEnabled ? 'linear-gradient(to right, #3C5BA4 0%, #E22A90 100%)' : 'red',
            color: '#fff'
        }
    }

    return (
        <>
            <StyledFab
                sx={fabStyles}
                ref={anchorRef}
                size='small'
                color='teal'
                aria-label='upsert'
                title='Upsert Vector Database'
                onClick={handleToggle}
                disabled={!isUpsertButtonEnabled}
            >
                {open ? <IconX style={{ width: '21px' }} /> : <IconDatabaseImport style={{ width: '21px' }} />}
            </StyledFab>

            <VectorStoreDialog
                show={showExpandDialog}
                dialogProps={expandDialogProps}
                onCancel={() => {
                    setShowExpandDialog(false)
                    setOpen((prevOpen) => !prevOpen)
                }}
                onIndexResult={(indexRes) => {
                    setShowExpandDialog(false)
                    setShowUpsertResultDialog(true)
                    setUpsertResultDialogProps({ ...indexRes })
                }}
            />

            <UpsertResultDialog
                show={showUpsertResultDialog}
                dialogProps={upsertResultDialogProps}
                onCancel={() => {
                    setShowUpsertResultDialog(false)
                    setOpen(false)
                }}
            />
        </>
    )
}

VectorStorePopUp.propTypes = {
    chatflowid: PropTypes.string.isRequired,
    isUpsertButtonEnabled: PropTypes.bool.isRequired
}
