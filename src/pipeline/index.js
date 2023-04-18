import { Grid, Box } from '@mui/material'
import React from 'react'
import { InputModular } from './InputModular'
import { MainBoard } from './MainBoard'

export const PipeLineBoard = () => {
    return (
        <Box
            sx={{ width: '100%', height: 'calc(100vh - 30px)' }}
            id="PipeBoxContainer"
        >
            <Grid container style={{ height: '100%' }}>
                <Grid item xs={3}>
                    <InputModular />
                </Grid>
                <Grid item xs={9}>
                    <MainBoard />
                </Grid>
            </Grid>
        </Box>
    )
}
