import { useState, useRef, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { IconDatabaseImport, IconX } from '@tabler/icons-react'

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'
import VectorStoreDialog from './VectorStoreDialog'
import UpsertResultDialog from './UpsertResultDialog'

const VectorStorePopUp = ({ chatflowid, isUpsertButtonEnabled }) => {
    const [open, setOpen] = useState(false)
    const [showExpandDialog, setShowExpandDialog] = useState(false)
    const [expandDialogProps, setExpandDialogProps] = useState({})
    const [showUpsertResultDialog, setShowUpsertResultDialog] = useState(false)
    const [upsertResultDialogProps, setUpsertResultDialogProps] = useState({})
    const customization = useSelector((state) => state.customization)

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

    return (
        <>
            <StyledFab
                ref={anchorRef}
                aria-label='upsert'
                title='Upsert Vector Database'
                onClick={handleToggle}
                disabled={!isUpsertButtonEnabled}
            >
                {open ? <IconX size={24} /> : <IconDatabaseImport size={24} />}
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
VectorStorePopUp.propTypes = { chatflowid: PropTypes.string }

export default memo(VectorStorePopUp)
