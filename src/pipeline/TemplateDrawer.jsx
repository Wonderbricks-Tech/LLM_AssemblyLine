import React from 'react'
import { useContext } from 'react'
import { ModularContext } from '@/hooks/EntityContext'
import {
    Drawer,
    Box,
    IconButton,
    Paper,
    InputBase,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Checkbox,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import BackspaceIcon from '@mui/icons-material/Backspace'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/webDB/db'
import { deleteModule } from '@/webDB/module'
import { deleteWorkflow } from '@/webDB/workflow'

const ModularListItem = (props) => {
    const { modules, setModules } = useContext(ModularContext)
    const { item, index } = props
    const [checked, setChecked] = React.useState(item?.checked ?? false)
    const deleteItem = () => {
        if (item.type === 'module') {
            deleteModule(item)
        } else if (item.type === 'workflow') {
            deleteWorkflow(item)
        }
        let findIndex = modules.findIndex((el) => {
            return el['id'] === item['id'] && el['type'] === item['type']
        })
        if (findIndex >= 0) {
            let tmp = modules
            tmp.splice(findIndex, 1)
            setModules([...tmp])
        }
    }
    const toggleChecked = () => {
        if (!checked) {
            //add to modules
            let findIndex = modules.findIndex((el) => {
                return el['id'] === item['id'] && el['type'] === item['type']
            })
            console.log(findIndex, modules)
            if (findIndex < 0) {
                item['checked'] = false
                modules.push(item)
                setModules([...modules])
            }
        }
        setChecked(!checked)
    }
    return (
        <>
            <ListItem
                key={item.name}
                style={{
                    width: '85%',
                    backgroundColor: '#EBF5FB',
                    overflow: 'hidden',
                    margin: '8px 8px',
                }}
                secondaryAction={
                    <Box display={'flex'} sx={{ alignItems: 'center' }}>
                        <Box
                            style={{
                                backgroundColor:
                                    item?.type === 'workflow'
                                        ? '#EB984E'
                                        : '#76D7C4',
                                color: '#FDFEFE',
                                fontFamily: 'Everett',
                                marginRight: '8px',
                                padding: '3px',
                            }}
                        >
                            {item.type === 'workflow' ? 'W' : 'M'}
                        </Box>
                        <IconButton
                            edge="end"
                            aria-label="detail"
                            onClick={deleteItem}
                        >
                            <BackspaceIcon />
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
                            checked={checked}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{
                                'aria-labelledby': item?.type + '-' + item?.id,
                            }}
                        />
                    </ListItemIcon>
                    <ListItemText
                        id={item?.type + '-' + item?.id}
                        primary={item.name}
                    />
                </ListItemButton>
            </ListItem>
        </>
    )
}

export const TemplateDrawer = () => {
    const { popUpState, setPopUpState } = useContext(ModularContext)
    const state = popUpState['templateDrawer']

    const modules = useLiveQuery(() => db.module.toArray())
    const workflows = useLiveQuery(() => db.workflow.toArray())
    const [lists, setLists] = React.useState([])

    const [itemList, setItemList] = React.useState([])
    const [keyword, setKeyword] = React.useState('')

    const changeKeyword = (event) => {
        setKeyword(event.target.value)
    }

    const filterItems = (e) => {
        if (e.key === 'Enter') {
            if (keyword === '') {
                setItemList(lists)
            } else {
                const result = lists.filter((item) => {
                    let name = item.name
                    if (name) {
                        let reg = new RegExp(keyword, 'i')
                        return name.search(reg) > -1
                    }
                    return false
                })
                setItemList(result)
            }
            e.preventDefault()
            return
        }
        if (keyword === '') {
            setItemList(lists)
            return
        } else {
            const result = lists.filter((item) => {
                let name = item.name
                if (name) {
                    let reg = new RegExp(keyword, 'i')
                    return name.search(reg) > -1
                }
                return false
            })
            setItemList(result)
        }
    }

    const handleDrawerClose = () => {
        setPopUpState['templateDrawer'](false)
    }

    React.useEffect(() => {
        let tmp = []
        if (modules?.length > 0) {
            tmp = tmp.concat(modules)
        }
        if (workflows?.length > 0) {
            tmp = tmp.concat(workflows)
        }
        setItemList(tmp)
        setLists(tmp)
        console.log(tmp)
    }, [modules, workflows])

    return (
        <>
            <Drawer
                variant="temporary"
                sx={{ flexShrink: 0 }}
                // ModalProps={{
                //     style: { position: 'absolute', right: 1 },
                // }}
                PaperProps={{
                    style: {
                        position: 'absolute',
                        boxShadow: 'none',
                    },
                }}
                anchor={'right'}
                open={state}
                // hideBackdrop={true}
                SlideProps={{
                    onEnter: (node) => {
                        node.style.webkitTransform = 'scaleX(0)'
                        node.style.transform = 'scaleX(0)'
                        node.style.transformOrigin = 'top right'
                    },
                }}
                onClose={handleDrawerClose}
            >
                <Box
                    style={{
                        width: '40vw',
                        padding: '8px',
                        position: 'relative',
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                        }}
                    >
                        <IconButton onClick={handleDrawerClose}>
                            <ClearIcon color="error" />
                        </IconButton>
                    </Box>
                    <Box style={{ display: 'flex', justifyContent: 'center' }}>
                        <Paper
                            component="form"
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: '80%',
                            }}
                        >
                            <IconButton sx={{ p: '10px' }} aria-label="menu">
                                <MenuIcon />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search Template or Modular"
                                inputProps={{
                                    'aria-label': 'search template or modular',
                                }}
                                value={keyword}
                                onChange={changeKeyword}
                                onKeyDown={filterItems}
                            />
                            <IconButton
                                type="button"
                                sx={{ p: '10px' }}
                                aria-label="search"
                                onClick={filterItems}
                            >
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                    </Box>
                    <Box style={{ margin: '6px' }}>
                        <Box
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            {itemList.map((item, index) => {
                                return (
                                    <ModularListItem
                                        key={item?.type + '-' + item?.id}
                                        item={item}
                                        index={index}
                                    />
                                )
                            })}
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    )
}
