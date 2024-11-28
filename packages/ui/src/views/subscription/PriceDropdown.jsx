import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

// import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'

import INRFlag from '../../assets/images/flags/india.png'
import USDFlag from '../../assets/images/flags/usd.png'
import GBPFlag from '../../assets/images/flags/GB.png'
import EuroFlag from '../../assets/images/flags/ero.png'

const PriceDropdown = ({ onCurrencyChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState('INR')
    const customization = useSelector((state) => state.customization)
    const dropdownRef = useRef(null)

    const currencyOptions = [
        { code: 'INR', flag: INRFlag },
        { code: 'USD', flag: USDFlag },
        { code: 'GBP', flag: GBPFlag },
        { code: 'Euro', flag: EuroFlag }
    ]

    const toggleDropdown = () => setIsOpen((prev) => !prev)

    const handleOptionClick = (option) => {
        setSelectedOption(option)
        setIsOpen(false)
        onCurrencyChange(option)
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div style={{ position: 'absolute', zIndex: '1000', right: '60px', top: '185px' }} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                style={{
                    width: '180px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: customization.isDarkMode ? '1px solid #8D8D8A' : '1px solid #8D8D8A',
                    color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                    borderRadius: '5px',
                    background: customization.isDarkMode ? '#191B1F' : '#F5FAFF',
                    cursor: 'pointer'
                }}
            >
                {selectedOption}
                {isOpen ? (
                    <ArrowDropUpIcon style={{ background: 'transparent', color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }} />
                ) : (
                    <ArrowDropDownIcon style={{ background: 'transparent', color: customization.isDarkMode ? '#e22a90' : '#3c5ba4' }} />
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        fontFamily: 'Cambria Math',
                        width: '180px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        background: '#fff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {currencyOptions.map(({ code, flag }) => (
                        <button
                            key={code}
                            onClick={() => handleOptionClick(code)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                width: '100%',
                                textAlign: 'left',
                                background: customization.isDarkMode ? '#191B1F' : '#F5FAFF',
                                color: customization.isDarkMode ? '#e22a90' : '#3c5ba4',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            <img src={flag} alt={`${code} flag`} style={{ width: '20px' }} />
                            {code}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

PriceDropdown.propTypes = {
    onCurrencyChange: PropTypes.func.isRequired
}

export default PriceDropdown
