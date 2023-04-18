import {
    Button,
    Paper,
    Divider,
    IconButton,
    Typography,
    SpeedDial,
    SpeedDialAction,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    DialogContentText,
    TextField,
    TextareaAutosize,
    Alert,
    Snackbar,
    Backdrop,
    CircularProgress,
} from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'

import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { styled } from '@mui/material/styles'
import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic'
import ImportContactsIcon from '@mui/icons-material/ImportContacts'
import { ModularContext } from '@/hooks/EntityContext'
import { TemplateDrawer } from './TemplateDrawer'
import { OutputPopup } from './OutputPopup'
import { postTextToLLM } from '@/service/pipeline'
import { createModule, modifyModule } from '@/webDB/module'
import { createWorkflow } from '@/webDB/workflow'
import { getPromptFromMW } from '@/webDB/common'

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: 48,
    lineHeight: '48px',
}))

const actions = [
    // { icon: <FileCopyIcon />, name: 'Copy' },
    // { icon: <SaveIcon />, name: 'Save' },
    // { icon: <PrintIcon />, name: 'Print' },
    { icon: <PlaylistAddIcon />, name: 'Add New Module' },
]

export const MainBoard = () => {
    // const userName = useSelector((state) => state.user.email)
    const [modules, setModules] = React.useState([])
    const [pickedModules, setPickedModules] = React.useState([])
    const [output, setOutput] = React.useState('')
    const [feedMsg, setFeedMsg] = React.useState('')
    const [templateDrawer, setTemplateDrawer] = React.useState(false)
    const [mOpen, setMOpen] = React.useState(false)
    const [modEditEnable, setModEditEnable] = React.useState(true)
    const [modStatus, setModStatus] = React.useState(null)
    const [sOpen, setSOpen] = React.useState(false)
    const [outOpen, setOutOpen] = React.useState(false)
    const [alertOpen, setAlertOpen] = React.useState(false)
    const [alertType, setAlertType] = React.useState('success')
    const [loading, setLoading] = React.useState(false)

    const modularContext = {
        modules: modules,
        setModules: setModules,
        popUpState: {
            templateDrawer: templateDrawer,
            outputState: outOpen,
        },
        setPopUpState: {
            templateDrawer: setTemplateDrawer,
            outputState: setOutOpen,
        },
    }

    const [moduleObj, setModuleObj] = React.useState({
        name: '',
        description: '',
        prompt: '',
        type: 'module',
        example: '',
    })

    const [workflow, setWorkflow] = React.useState({
        name: '',
        description: '',
        example: '',
        type: 'workflow',
    })

    const removePipeLineModule = (item, index) => {
        pickedModules.splice(index, 1)
        setPickedModules([...pickedModules])
        let findIndex = modules.findIndex((el) => {
            return el.id === item.id
        })
        modules[findIndex]['checked'] = false
        setModules([...modules])
    }

    const removeModules = (item, index) => {
        let findIndex = pickedModules.findIndex((el) => {
            return el.id === item.id
        })
        if (findIndex >= 0) {
            pickedModules.splice(findIndex, 1)
            setPickedModules([...pickedModules])
        }
        modules.splice(index, 1)
        setModules([...modules])
    }

    const toggleChecked = (item, index) => {
        console.log(item)
        modules[index]['checked'] = !modules[index]['checked']
        setModules([...modules])
        if (modules[index]['checked']) {
            pickedModules.push(modules[index])
            setPickedModules([...pickedModules])
        } else {
            let findIndex = pickedModules.findIndex((el) => {
                return el.id === item.id
            })
            pickedModules.splice(findIndex, 1)
            setPickedModules([...pickedModules])
        }
    }

    const addNewModule = () => {
        setModuleObj({
            name: '',
            description: '',
            prompt: '',
            type: 'module',
            example: '',
        })
        setModStatus('create')
        setMOpen(true)
    }

    const importTemplate = () => {
        setTemplateDrawer(true)
    }

    //get flat of workflows and modules
    const flatMWArray = async (params) => {
        let result = []
        for (let param of params) {
            if (param.type === 'module') {
                result.push(await getPromptFromMW(param))
            } else if (param.type === 'workflow') {
                let workflow = await getPromptFromMW(param)
                let children = workflow.children
                result.push.apply(result, await flatMWArray(children))
            }
        }
        return result
    }

    const runPipeLine = async () => {
        let txt = document.getElementById('wb-pipeline-input').innerHTML
        setLoading(true)
        try {
            let modules = pickedModules.map((item) => {
                return {
                    id: item.id,
                    type: item.type,
                }
            })
            let params = await flatMWArray(modules)
            diliverCall(params, 0, txt)
        } catch (e) {
            setLoading(false)
        }
    }

    const diliverCall = (arrays, index, input) => {
        if (index >= arrays.length) {
            setOutOpen(true)
            setOutput(input)
            setLoading(false)
            return
        }

        let data = {
            prompt: arrays[index]['prompt'],
            input: input,
        }

        postTextToLLM(data).then((res) => {
            console.log(res)
            if (res?.success) {
                let input = res.content
                diliverCall(arrays, index + 1, input)
            } else {
                setLoading(false)
                setAlertOpen(true)
                setAlertType('error')
                setFeedMsg(res?.message)
                return
            }
        })
    }

    // model
    const handlerModelClose = () => {
        setModuleObj({})
        setMOpen(false)
    }

    const handleSubmitClose = () => {
        setSOpen(false)
    }

    const modifyWorkflowName = (event) => {
        let value = event.target.value
        workflow.name = value
        setWorkflow({
            ...workflow,
        })
    }

    const modifyWorkflowDescription = (event) => {
        let value = event.target.value
        workflow.description = value
        setWorkflow({
            ...workflow,
        })
    }

    const modifyWorkflowExample = (event) => {
        let value = event.target.value
        workflow.example = value
        setWorkflow({
            ...workflow,
        })
    }

    const submitWorkflow = () => {
        if (pickedModules.length > 0) {
            let tmp = pickedModules.map((item) => {
                return {
                    id: item['id'],
                    type: item.type,
                }
            })
            workflow['children'] = tmp

            console.log(workflow)
            createWorkflow(workflow).then((res) => {
                if (res.success) {
                    setSOpen(false)
                    setAlertType('success')
                    setFeedMsg('Save workflow successfuly')
                    setAlertOpen(true)
                } else {
                    setAlertType('error')
                    setFeedMsg(res.message)
                    setAlertOpen(true)
                }
            })
        } else {
            setSOpen(false)
            setAlertType('error')
            setFeedMsg('No Module Provided')
            setAlertOpen(true)
        }
    }

    const showModuleDetail = (item) => {
        // if (userName === item.creator) {
        //     setModStatus('edit')
        // } else {
        //     setModStatus('display')
        // }
        setModStatus('edit')
        setMOpen(true)
        setModuleObj(item)
    }

    const changeModuleName = (event) => {
        let value = event.target.value
        moduleObj.name = value
        setModuleObj({
            ...moduleObj,
        })
    }
    const changeModulePrompt = (event) => {
        let value = event.target.value
        moduleObj.prompt = value
        setModuleObj({
            ...moduleObj,
        })
    }
    const changeModuleDescription = (event) => {
        let value = event.target.value
        moduleObj.description = value
        setModuleObj({
            ...moduleObj,
        })
    }
    const changeModuleExample = (event) => {
        let value = event.target.value
        moduleObj.example = value
        setModuleObj({
            ...moduleObj,
        })
    }

    //create module
    const saveModule = () => {
        if (modStatus === 'create') {
            createModule(moduleObj).then((res) => {
                if (res.success) {
                    setMOpen(false)
                    setAlertType('success')
                    setFeedMsg('Save module successfuly')
                    setAlertOpen(true)
                    let module = res.data
                    modules.push(module)
                    setModules([...modules])
                } else {
                    setMOpen(false)
                    setAlertType('error')
                    setFeedMsg(res.message)
                    setAlertOpen(true)
                }
            })
        } else if (modStatus === 'edit') {
            modifyModule(moduleObj).then((res) => {
                if (res.success) {
                    setMOpen(false)
                    setAlertType('success')
                    setFeedMsg('Edit module successfuly')
                    setAlertOpen(true)

                    //update current module & pickedModule list
                    let findIndex = pickedModules.findIndex((el) => {
                        return el.id === moduleObj.id
                    })
                    if (findIndex >= 0) {
                        pickedModules[findIndex] = moduleObj
                        setPickedModules([...pickedModules])
                    }
                    let mIndex = modules.findIndex((el) => {
                        return el.id === moduleObj.id
                    })
                    modules[mIndex] = moduleObj
                    setModules([...modules])
                } else {
                    setMOpen(false)
                    setAlertType('error')
                    setFeedMsg(res.message)
                    setAlertOpen(true)
                }
            })
        }
    }

    const handleAlertClose = () => {
        setAlertOpen(false)
    }

    React.useEffect(() => {
        if (modStatus === 'edit' || modStatus === 'create') {
            setModEditEnable(true)
        } else if (modStatus === 'display') {
            setModEditEnable(false)
        }
    }, [modStatus])

    return (
        <>
            {/* Current Component Line */}
            <ModularContext.Provider value={modularContext}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <Box
                        style={{
                            border: '1px dashed #E59866',
                            borderRadius: '8px',
                            height: '200px',
                            marginTop: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            marginRight: '5px',
                        }}
                    >
                        <Box
                            style={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                            }}
                        >
                            {pickedModules?.map((item, index) => {
                                return (
                                    <Box
                                        key={'picked-module-' + index}
                                        style={{
                                            margin: '8px',
                                            backgroundColor: '#D6EAF8',
                                            color: '#5D6D7E',
                                            height: '45px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingLeft: '16px',
                                            borderLeft: '5px solid #3498DB',
                                        }}
                                    >
                                        <Typography
                                            style={{
                                                fontFamily: 'Everett',
                                                fontSize: 20,
                                            }}
                                        >
                                            {item.name}
                                        </Typography>
                                        <IconButton
                                            onClick={() => {
                                                removePipeLineModule(
                                                    item,
                                                    index
                                                )
                                            }}
                                            style={{
                                                marginLeft: '15px',
                                            }}
                                        >
                                            <PlaylistRemoveIcon color="error" />
                                        </IconButton>
                                    </Box>
                                )
                            })}
                        </Box>
                        <Box
                            sx={{
                                height: '50px',
                                display: 'flex',
                                flexDirection: 'row-reverse',
                            }}
                        >
                            <Button
                                variant="outlined"
                                color="primary"
                                style={{ marginLeft: '4px' }}
                                onClick={runPipeLine}
                            >
                                {' '}
                                Run PipeLine
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => {
                                    setSOpen(true)
                                }}
                            >
                                {' '}
                                Save Workflow
                            </Button>
                        </Box>
                    </Box>
                    <Divider
                        textAlign="left"
                        style={{ margin: '4px 0px' }}
                    ></Divider>
                    <Box style={{ flexGrow: 1, display: 'flex' }}>
                        <Divider orientation="vertical" flexItem />
                        {/* Place the most used module */}
                        <Box style={{ flexGrow: 1, paddingLeft: '5px' }}>
                            <Item
                                key={'module-head'}
                                elevation={2}
                                style={{
                                    marginTop: '6px',
                                    width: '120px',
                                    height: '48px',
                                    backgroundColor: '#FCF3CF',
                                    color: '#F39C12',
                                    fontFamily: 'Everett',
                                    fontSize: 18,
                                    cursor: 'default',
                                }}
                            >
                                Module
                            </Item>
                            {/* Module List */}
                            <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {modules.map((item, index) => {
                                    return (
                                        <ListItem
                                            key={item.name}
                                            style={{
                                                width: '320px',
                                                backgroundColor: '#F2F3F4',
                                                overflow: 'hidden',
                                                margin: '8px 8px',
                                            }}
                                            secondaryAction={
                                                <Box>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="detail"
                                                        style={{
                                                            marginRight: '5px',
                                                        }}
                                                        onClick={() => {
                                                            showModuleDetail(
                                                                item
                                                            )
                                                        }}
                                                    >
                                                        <AutoAwesomeMosaicIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="detail"
                                                        onClick={() => {
                                                            removeModules(
                                                                item,
                                                                index
                                                            )
                                                        }}
                                                    >
                                                        <PlaylistRemoveIcon />
                                                    </IconButton>
                                                </Box>
                                            }
                                        >
                                            <ListItemButton
                                                role={undefined}
                                                onClick={() => {
                                                    toggleChecked(item, index)
                                                }}
                                                dense
                                            >
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={item?.checked}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        inputProps={{
                                                            'aria-labelledby':
                                                                item?.id,
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    id={item.id}
                                                    primary={item.name}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                })}
                            </Box>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        {/* Function List */}
                        <Box
                            style={{
                                minWidth: '350px',
                                width: '350px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <ListItem
                                key={'AddModule'}
                                style={{
                                    margin: '10px',
                                    width: '90%',
                                    height: '50px',
                                    backgroundColor: '#E0E0E0',
                                }}
                                disablePadding
                            >
                                <ListItemButton
                                    role={undefined}
                                    onClick={addNewModule}
                                    dense
                                >
                                    <ListItemIcon>
                                        <PlaylistAddIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={'addNewModule'}
                                        primary={`Add New Module`}
                                    />
                                </ListItemButton>
                            </ListItem>
                            <ListItem
                                key={'ImportTemplate'}
                                style={{
                                    marginTop: '6px',
                                    width: '90%',
                                    height: '50px',
                                    backgroundColor: '#E0E0E0',
                                }}
                                disablePadding
                            >
                                <ListItemButton
                                    role={undefined}
                                    onClick={importTemplate}
                                    dense
                                >
                                    <ListItemIcon>
                                        <ImportContactsIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        id={'import-template-text'}
                                        primary={`Import Workflow or Module`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </Box>

                        <SpeedDial
                            ariaLabel="SpeedDial basic example"
                            sx={{ position: 'absolute', bottom: 16, right: 16 }}
                            icon={<SpeedDialIcon />}
                        >
                            {actions.map((action) => (
                                <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipTitle={action.name}
                                />
                            ))}
                        </SpeedDial>
                    </Box>

                    {/* Popup Model */}
                    <Dialog
                        open={mOpen}
                        onClose={handlerModelClose}
                        scroll={'paper'}
                        aria-labelledby="scroll-dialog-title"
                        aria-describedby="scroll-dialog-description"
                        fullWidth={true}
                        maxWidth={'md'}
                    >
                        <DialogTitle id="scroll-dialog-title">
                            Module Create/Modify
                        </DialogTitle>
                        <DialogContent dividers={true}>
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Box style={{ display: 'flex' }} m={1}>
                                    <Typography
                                        variant="h6"
                                        style={{ minWidth: '200px' }}
                                    >
                                        Name
                                    </Typography>
                                    <TextField
                                        value={moduleObj?.name ?? ''}
                                        onChange={changeModuleName}
                                        hiddenLabel
                                        autoComplete="off"
                                        size="small"
                                        disabled={!modEditEnable}
                                    ></TextField>
                                </Box>
                                <Box style={{ display: 'flex' }} m={1}>
                                    <Typography
                                        variant="h6"
                                        style={{ minWidth: '200px' }}
                                    >
                                        Prompt
                                    </Typography>
                                    <Box
                                        style={{
                                            flexGrow: 1,
                                            marginRight: '6px',
                                        }}
                                    >
                                        <TextareaAutosize
                                            value={moduleObj?.prompt ?? ''}
                                            onChange={changeModulePrompt}
                                            minRows={4}
                                            maxRows={6}
                                            disabled={!modEditEnable}
                                            style={{
                                                width: '100%',
                                                resize: 'none',
                                                outlineColor: '#007aff',
                                                marginTop: '4px',
                                                fontFamily: 'Everett',
                                                fontSize: 20,
                                                border: '1px solid #BDC3C7',
                                                borderRadius: '4px',
                                            }}
                                        ></TextareaAutosize>
                                        <span
                                            style={{
                                                fontFamily: 'Everett',
                                                color: '#AEB6BF',
                                            }}
                                        >
                                            The prompt needs to be clear and
                                            easy to understand, precise and
                                            logical.
                                        </span>
                                    </Box>
                                </Box>
                                <Box style={{ display: 'flex' }} m={1}>
                                    <Typography
                                        variant="h6"
                                        style={{ minWidth: '200px' }}
                                    >
                                        Description
                                    </Typography>
                                    <TextareaAutosize
                                        value={moduleObj?.description ?? ''}
                                        onChange={changeModuleDescription}
                                        minRows={6}
                                        maxRows={8}
                                        disabled={!modEditEnable}
                                        style={{
                                            width: '100%',
                                            resize: 'none',
                                            outlineColor: '#007aff',
                                            marginTop: '4px',
                                            fontFamily: 'Everett',
                                            fontSize: 20,
                                            border: '1px solid #BDC3C7',
                                            borderRadius: '4px',
                                        }}
                                    ></TextareaAutosize>
                                </Box>

                                <Box style={{ display: 'flex' }} m={1}>
                                    <Typography
                                        variant="h6"
                                        style={{ minWidth: '200px' }}
                                    >
                                        Example
                                    </Typography>
                                    <TextareaAutosize
                                        value={moduleObj?.example ?? ''}
                                        onChange={changeModuleExample}
                                        minRows={2}
                                        maxRows={4}
                                        disabled={!modEditEnable}
                                        style={{
                                            width: '100%',
                                            resize: 'none',
                                            outlineColor: '#007aff',
                                            marginTop: '4px',
                                            fontFamily: 'Everett',
                                            fontSize: 20,
                                            border: '1px solid #BDC3C7',
                                            borderRadius: '4px',
                                        }}
                                    ></TextareaAutosize>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                color="error"
                                autoFocus
                                variant="outlined"
                                onClick={handlerModelClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                autoFocus
                                variant="outlined"
                                onClick={saveModule}
                                disabled={!modEditEnable}
                            >
                                Save changes
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {/* Workflow submit Model */}
                    <Dialog open={sOpen} onClose={handleSubmitClose}>
                        <DialogTitle>Workflow</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                To save this workflow, please enter your
                                workflow info here.
                            </DialogContentText>
                            <Box>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="name"
                                    label="Workflow Name"
                                    fullWidth
                                    variant="standard"
                                    value={workflow?.name}
                                    onChange={modifyWorkflowName}
                                />
                                <TextField
                                    margin="dense"
                                    id="description"
                                    label="Description"
                                    fullWidth
                                    multiline
                                    variant="standard"
                                    maxRows={3}
                                    value={workflow?.description}
                                    onChange={modifyWorkflowDescription}
                                />
                                <TextField
                                    margin="dense"
                                    id="name"
                                    label="Example"
                                    fullWidth
                                    variant="standard"
                                    multiline
                                    maxRows={3}
                                    value={workflow?.example}
                                    onChange={modifyWorkflowExample}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleSubmitClose}>Cancel</Button>
                            <Button onClick={submitWorkflow}>Summit</Button>
                        </DialogActions>
                    </Dialog>

                    <OutputPopup output={output} />

                    {/* Drawer */}
                    <TemplateDrawer />
                    {/* Feedback Info Popup */}
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={alertOpen}
                        autoHideDuration={3500}
                        onClose={handleAlertClose}
                    >
                        <Alert
                            onClose={handleAlertClose}
                            variant="filled"
                            severity={alertType}
                        >
                            {feedMsg}
                        </Alert>
                    </Snackbar>
                    <Backdrop
                        sx={{
                            color: '#FFF',
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                        }}
                        open={loading}
                    >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </Box>
            </ModularContext.Provider>
        </>
    )
}
