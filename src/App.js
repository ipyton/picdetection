import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Stack } from '@mui/material';
import { Button } from '@mui/material';
import { List } from '@mui/material';
import { TextField } from '@mui/material';
import { Chip } from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useParams } from 'react-router-dom';
import AuthUtil from './axios_util/AuthUtil';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import PictureManiputingUtil from './axios_util/PictureManipulatingUtil';
import { eventWrapper } from '@testing-library/user-event/dist/utils';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function Item(props) {
  return (
    <Box
      component="img"
      sx={{
        height: "auto",
        width: "100%",
        loading: "lazy"
      }}
      alt={props.item.original}
      src={props.item.original}

    />
  )
}

function App() {
  const [relationship, setRelationship] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [access_token, set_access_token] = React.useState("===")
  const [idToken, setIdToken] = React.useState("------")

  const [loggedIn, setIsLoggedIn] = React.useState(false)
  const [isLogging, setIsLogging] = React.useState(true)
  const [tags, setTags] = React.useState([])
  const [tag, setTag] = React.useState("")
  const [selector, setSelector] = React.useState(0)
  const [editsInput, setEditsInput] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [items, setItems] = React.useState([
  ])
  const [selectorTags, setSelectorTags] = React.useState([])
  const [selectorPics, setSelectorPics] = React.useState("")
  const [subscribeTags, setSubscribeTags] = React.useState([])


  const [subscribeText, setSubscribeText] = React.useState("")


  const [subscribeOpen, setSubscribeOpen] = React.useState(false)

  const [url, setURL] = React.useState("")

  React.useEffect(() => {
    console.log("he;lo")
    const params = window.location.search.substring(1)
    const searchParams = new URLSearchParams(params)
    AuthUtil.auth(searchParams.get("code"), setIdToken, setIsLoggedIn, setIsLogging)
    //console.log(searchParams.get("code"))
  }, [])




  const onModify = () => {
    PictureManiputingUtil.setPictureTags(selector, selectorTags, "modify")
  }

  const handleDeleteItem = () => {
    PictureManiputingUtil.setPictureTags(selector, selectorTags, "delete")
    setOpen(false)

  }
  const onEditsAdd = () => {
    if (editsInput && editsInput.length !== 0) {
      setSelectorTags([...selectorTags, editsInput])
      setEditsInput("")

    }
  }
  const onEditChange = (event) => {
    setEditsInput(event.target.value)
  }

  const handleSearch = () => {
    PictureManiputingUtil.getPicturesByTags(tags, relationship,setItems)
  }

  const handleAddTags = () => {
    if (tag && tag.length !== 0) {
      setTags([...tags, tag])
      setTag("")
    }

  }

  const handleInputChange = (event) => {
    setTag(event.target.value)
  }

  const handleClickOpen = (url) => {
    return () => {
      setSelectorTags([])
      setSelectorPics("")
      setSelector(url)
      PictureManiputingUtil.query_details(url,setSelectorTags, setSelectorPics)
      setOpen(true);
    }
  };

  const handleClose = () => {
    setEditsInput("")
    setOpen(false);
  };
  const handleSubcribeClose = () => {

    setSubscribeOpen(false)

  }

  const handleSubscribe = () => {

    PictureManiputingUtil.subscribe(subscribeTags)
    setSubscribeTags([])
  }

  const handleRelationshipChange = (event) => {
    setRelationship(event.target.value);
  };

  const handleDelete = (idx) => {
    return () => {
      console.info('You clicked the delete icon.');
      tags.splice(idx, 1)
      console.log(tags)
      setTags([...tags])
    }
  };

  const handleSubscribeOpen = () => {
    setSubscribeOpen(true)
  }
  const handleModifyDelete = (idx) => {
    return () => {
      selectorTags.splice(idx, 1)
      setSelectorTags([...selectorTags])
    }
  }
  const handleSearchByPics = (event) => {
    console.log(event.target.files[0])
    const file = event.target.files[0]
    if (file.type !== "image/jpeg") {
      console.log("error input")
      return
    }
    setItems([])
    PictureManiputingUtil.picForPics(file,setUploadProgress, setItems)

  }


  const handleSubscribeDelete = (idx) => {
    return () => {
      subscribeTags.splice(idx, 1)
      setSubscribeTags([...subscribeTags])
    }
  }

  const handleSubscribeAdd = (event) => {
    subscribeTags.push(subscribeText)
    setSubscribeText("")
    setSubscribeTags([...subscribeTags])
    console.log(subscribeTags)
  }


  const handleOnFileChange = (event) => {
    console.log(event.target.files[0])
    const file = event.target.files[0]
    if (!file || file.type !== "image/jpeg") {
      console.log("error input")
      return
    }
    PictureManiputingUtil.uploadPic(event.target.files[0], setUploadProgress)
  }
  const onSubscribeTextChange = (event) => {
    setSubscribeText(event.target.value)
  }
  const handleURLChange = (event) => {
    setURL(event.target.value)
  }

  const searchByURL = (event) => {
    setSelectorTags([])
    setSelectorPics("")
    setSelector(url)
    PictureManiputingUtil.query_details(url, setSelectorTags, setSelectorPics)
    setOpen(true)
  }


  // if (isLogging) {
  //   return <div>is login</div>
  // }
  // if (!loggedIn) {
  //   return <div>login failed</div>
  // }


  return (
    <Stack sx={{ width: "80%", marginLeft: "10%" }} spacing={3}>
      {access_token}
      <Stack direction="row" >
        <Stack direction="row" spacing={1}>
          {tags.map((item, idx) => {
            return <Chip label={item} onDelete={handleDelete(idx)} />
          })}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={3}>
        <TextField id="outlined-basic" label="Input a tag" variant="outlined" value={tag} onChange={handleInputChange} />
        <Button variant="outlined" onClick={handleAddTags}>Add Tag</Button>
        <Button variant="outlined" onClick={handleSubscribeOpen}>subscribe</Button>
      </Stack>

      <Stack direction="row" spacing={3}>
        <FormControl sx={{ width: "28%" }}>
          <InputLabel id="demo-simple-select-label">Relationship</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={relationship}
            label="Age"
            onChange={handleRelationshipChange}
          >
            <MenuItem value={"and"}>And</MenuItem>
            <MenuItem value={"or"}>Or</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleSearch}>Search</Button>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload file
          <VisuallyHiddenInput type="file" onChange={handleOnFileChange} />
        </Button>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          search by image
          <VisuallyHiddenInput type="file" onChange={handleSearchByPics} />
        </Button>
      </Stack>
      <Stack direction="row" spacing={3}>
        <TextField id="outlined-basic" label="Search By URL" variant="outlined" value={url} onChange={handleURLChange} />
        <Button variant="outlined" onClick={searchByURL}>search by url</Button>

      </Stack>

      <ImageList sx={{ width: "80%", marginLeft: "10%" }}>
        {items.map((item, idx) => (
          <ImageListItem key={item.img}>
            <img
              // srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={item}
              //alt={item.title}
              loading="lazy"
            />
            <ImageListItemBar
              title={item.tags}
              subtitle={item.author}
              actionIcon={
                <IconButton
                  onClick={handleClickOpen(item)}
                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                  aria-label={`info about ${item.title}`}
                >
                  <InfoIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
      <React.Fragment >

        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email;
              console.log(email);
              handleClose();
            },
            sx: {
              width: "50%",
              maxHeight: 300
            }
          }}
        >


          <DialogTitle>Edit</DialogTitle>
          <Stack direction="row">
            <Stack sx={{ width: "40%" }}>
              <Box>
                <Item item={{ original: selectorPics }}></Item>
              </Box>
            </Stack>
            <Stack sx={{ width: "60%" }}>
              <Stack direction="row" spacing={1} >
                {
                  selectorTags.map((item, idx) => {
                    return <Chip label={item} variant="outlined" onDelete={handleModifyDelete(idx)} />
                  })
                }
              </Stack>
              <TextField id="outlined-basic" label="Input a label" variant="outlined" onChange={onEditChange} value={editsInput} />
              <Button variant="outlined" onClick={onEditsAdd}>Add</Button>



            </Stack>


          </Stack>


          <DialogActions>
            <Button variant="outlined" onClick={handleDeleteItem}>Delete</Button>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={onModify}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>



      <React.Fragment >

        <Dialog
          open={subscribeOpen}
          onClose={handleSubcribeClose}
          PaperProps={{
            component: 'form',
            onSubmit: (event) => {
              event.preventDefault();
              // const formData = new FormData(event.currentTarget);
              // const formJson = Object.fromEntries(formData.entries());
              // const email = formJson.email;
              // console.log(email);
              handleSubcribeClose();
            },
            sx: {
              width: "50%",
              maxHeight: 300
            }
          }}
        >


          <DialogTitle>Subscribe</DialogTitle>
          <Stack direction="row">
            <Stack sx={{ width: "60%" }}>
              <Stack direction="row" spacing={1} >
                {
                  subscribeTags.map((item, idx) => {
                    return <Chip label={item} variant="outlined" onDelete={handleSubscribeDelete(idx)} />
                  })
                }
              </Stack>
              <TextField id="outlined-basic" label="Input a label" variant="outlined" onChange={onSubscribeTextChange} value={subscribeText} />
              <Button variant="outlined" onClick={handleSubscribeAdd}>Add</Button>
            </Stack>
          </Stack>
          <DialogActions>
            <Button variant="outlined" onClick={handleSubscribeDelete}>Delete</Button>
            <Button onClick={handleSubcribeClose}>Cancel</Button>
            <Button type="submit" onClick={handleSubscribe}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </Stack>
  );
}

export default App;
