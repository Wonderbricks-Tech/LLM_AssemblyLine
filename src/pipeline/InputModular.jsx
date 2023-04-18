import { Box, Tab, Tabs, TextareaAutosize } from '@mui/material'
import React from 'react'
import { TabPanel } from '@/components/TabPanel'
import { blue } from '@/components/colorSet'

export const InputModular = () => {
    const [tabValue, setTabValue] = React.useState(0)
    const [inputTxt, setInputTxt] = React.useState('')

    const handlerTabChange = (_, newValue) => {
        setTabValue(newValue)
    }

    const handlerInputTxtChange = (event) => {
        const value = event.target.value
        setInputTxt(value)
    }

    return (
        <>
            <Box
                style={{
                    height: '100%',
                    padding: '10px',
                    marginTop: '8px',
                    borderRadius: '4px',
                }}
            >
                <Tabs value={tabValue} onChange={handlerTabChange}>
                    <Tab label="Input" id="pipeline-input-1"></Tab>
                </Tabs>
                <TabPanel value={tabValue} index={0}>
                    <Box>
                        <TextareaAutosize
                            minRows={20}
                            maxRows={25}
                            value={inputTxt}
                            id="wb-pipeline-input"
                            onChange={handlerInputTxtChange}
                            style={{
                                width: '100%',
                                resize: 'none',
                                outlineColor: blue.secondary.code,
                                marginTop: '4px',
                                fontFamily: 'Everett',
                                fontSize: 20,
                                border: '1px solid #BDC3C7',
                                borderRadius: '4px',
                            }}
                        ></TextareaAutosize>
                    </Box>
                </TabPanel>
            </Box>
        </>
    )
}
