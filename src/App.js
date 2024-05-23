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

function App() {
  const [relationship, setRelationship] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [access_token, set_access_token] = React.useState("===")
  const [idToken, setIdToken] = React.useState("------")

  const [loggedIn, setIsLoggedIn] = React.useState(false)
  const [isLogging, setIsLogging] = React.useState(true)
  const [tags, setTags] = React.useState(["aa", "bb", "cc"])
  const [tag, setTag] = React.useState("")
  const [selector, setSelector] = React.useState(0)
  const [editsInput, setEditsInput] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [items, setItems] = React.useState([
    {
      img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
      id: "11111",
      tags: ["111", "222"],
      featured: true,
    },
    {
      img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
      id: "222222",
      tags: ["333", "444"]
    },
    {
      img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
      id: "3333",
      tags: ["555", "666"]
    },
    {
      img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
      id: "4444",
      tags: ["777", "888"]
    },
    {
      img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
      id: "5555",
      tags: ["999", "101010"],
      cols: 2,
    },
    {
      img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
      id: "6666",
      tags: ["11", "12"],
      featured: true,
    },

  ])
  const [selectorTags, setSelectorTags] = React.useState([])

  React.useEffect(() => {
    console.log("he;lo")
    const params = window.location.search.substring(1)
    const searchParams = new URLSearchParams(params)
    AuthUtil.auth(searchParams.get("code"), setIdToken, setIsLoggedIn, setIsLogging)
    //console.log(searchParams.get("code"))
  }, [])




  const onModify = () => {
    PictureManiputingUtil.setPictureTags(items[selector].id, selectorTags,"modify")
  }

  const handleDeleteItem = ()=> {
    PictureManiputingUtil.setPictureTags(items[selector].id, selectorTags, "delete")

  }
  const onEditsAdd = () => {
    if (editsInput && editsInput.length != 0) {
      setSelectorTags([...selectorTags, editsInput])
      setEditsInput("")

    }
  }
  const onEditChange = (event) => {
    setEditsInput(event.target.value)
  }

  const handleSearch = () => {
    PictureManiputingUtil.getPicturesByTags(tags, relationship)
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

  const handleClickOpen = (idx) => {
    return () => {
      setSelector(idx)
      console.log(idx)
      setSelectorTags(items[idx].tags)
      console.log(selectorTags)
      setOpen(true);
    }
  };

  const handleClose = () => {
    setEditsInput("")
    setOpen(false);
  };

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


  const handleModifyDelete = (idx) => {
    return () => {
      selectorTags.splice(idx, 1)
      setSelectorTags([...selectorTags])
    }


  }


  const handleOnFileChange = (event) => {
    console.log(event.target.files[0])

    const file = event.target.files[0]
    if (file.type !== "image/jpeg") {
      console.log("error input")
      return
    }
    PictureManiputingUtil.uploadPic(event.target.files[0], setUploadProgress)
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
      </Stack>

      <ImageList sx={{ width: "80%", marginLeft: "10%" }}>
        {items.map((item, idx) => (
          <ImageListItem key={item.img}>
            <img
              srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.img}?w=248&fit=crop&auto=format`}
              alt={item.title}
              loading="lazy"
            />
            <ImageListItemBar
              title={item.tags}
              subtitle={item.author}
              actionIcon={
                <IconButton
                  onClick={handleClickOpen(idx)}
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
          }}
        >
          <DialogTitle>Edit</DialogTitle>
          <DialogContent >
            <Stack direction="row" spacing={1} >
              {
                selectorTags.map((item, idx) => {
                  return <Chip label={item} variant="outlined" onDelete={handleModifyDelete(idx)} />
                })
              }
            </Stack>
            <TextField id="outlined-basic" label="Input a label" variant="outlined" onChange={onEditChange} value={editsInput} />
            <Button variant="outlined" onClick={onEditsAdd}>Add</Button>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleDeleteItem}>Delete</Button>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={onModify}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>

    </Stack>
  );
}

export default App;
