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

function removeElement(array, element) {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
  }
  return array;
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
  const [plus, setPlus] = React.useState([])
  const [repetitions, setRepetitions] = React.useState(0)


  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    const searchParams = new URLSearchParams(hash)
    console.log(searchParams)
    if (searchParams.get("id_token")) {
      localStorage.setItem("id_token", searchParams.get("id_token"))
      const { protocol, host, pathname } = window.location;
      window.location.replace(`${protocol}//${host}${pathname}`);
    } else if (localStorage.getItem("id_token")) {
      AuthUtil.authByIdToken(localStorage.getItem("id_token"), setIsLoggedIn, setIsLogging)
    } else if (searchParams.get("code")) {
      AuthUtil.authByCode(searchParams.get("code"), setIdToken, setIsLoggedIn, setIsLogging)
    } else {
      setIsLoggedIn(false)
      setIsLogging(false)
    }
    //console.log(searchParams.get("code"))
  }, [])


  const changeRepetitions = (event) => {
    setRepetitions(event.target.value)

  }


  const onModify = () => {
    PictureManiputingUtil.setPictureTags(selector, selectorTags, "modify", plus)
  }

  const handleDeleteItem = () => {
    PictureManiputingUtil.setPictureTags(selector, selectorTags, "delete")
    setOpen(false)

  }
  const onEditsAdd = () => {
    if (editsInput && editsInput.length !== 0) {
      setSelectorTags([...selectorTags, editsInput])
      setPlus([...plus, editsInput])
      setEditsInput("")

    }
  }
  const onEditChange = (event) => {
    setEditsInput(event.target.value)
  }

  const handleSearch = () => {
    PictureManiputingUtil.getPicturesByTags(tags, relationship, setItems)
  }

  const handleAddTags = () => {
    const num = Number(repetitions);

    // 检查转换后的值是否为 NaN，并且大于零
    if (isNaN(num) || num <= 0) {
      setRepetitions()
      return
    }

    if (tag && tag.length !== 0 && tags.indexOf(tag) === -1) {
      setTags([...tags, { tag: tag, repetitions: repetitions }])
      setTag("")
      setRepetitions(1)
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
      PictureManiputingUtil.query_details(url, setSelectorTags, setSelectorPics)
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
    PictureManiputingUtil.update_tags(subscribeTags)
    setSubscribeTags([])

  }

  const handleRelationshipChange = (event) => {
    setRelationship(event.target.value);
  };

  const handleDelete = (idx) => {
    return () => {
      console.info('You clicked the delete icon.');
      removeElement(plus, tags[idx])
      setPlus([...plus])
      tags.splice(idx, 1)
      setTags([...tags])
    }
  };

  const handleSubscribeOpen = () => {
    PictureManiputingUtil.query_tags("example", setSubscribeTags)
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
    PictureManiputingUtil.picForPics(file, setUploadProgress, setItems)

  }


  const handleSubscribeDelete = (idx) => {
    return () => {
      subscribeTags.splice(idx, 1)
      setSubscribeTags([...subscribeTags])
    }
  }

  const handleSubscribeAdd = (event) => {
    if (subscribeText && subscribeText.length !== 0 && subscribeTags.indexOf(subscribeText) === -1) {
      subscribeTags.push(subscribeText)
      setSubscribeText("")
      setSubscribeTags([...subscribeTags])
      console.log(subscribeTags)

    }

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
  const handleLogout = () => {
    localStorage.removeItem("id_token")
    localStorage.removeItem("email")
    window.location.replace("https://pic-detection.auth.us-east-1.amazoncognito.com/login?client_id=nph8bkpt4co0j5bpur1lplc3n&response_type=token&scope=email+openid+profile&redirect_uri=https%3A%2F%2Fmain.d1naxchdsbctyj.amplifyapp.com%2F")
  }
  const searchByURL = (event) => {
    setSelectorTags([])
    setSelectorPics("")
    setSelector(url)
    PictureManiputingUtil.query_details(url, setSelectorTags, setSelectorPics)
    setOpen(true)
  }

  if (isLogging) {
    return <div>is logining</div>
  }
  if (!loggedIn) {
    return <div>Have not login yet. Click here to login!<Button variant="outlined" onClick={handleLogout}>Go to login page</Button>
    </div>
  }


  return (
    <Stack sx={{ width: "80%", marginLeft: "10%" }} spacing={3}>
      {access_token}
      <Stack direction="row" >
        <Stack direction="row" spacing={1}>
          {tags.map((item, idx) => {
            return <Chip label={item.tag + " : " + item.repetitions} onDelete={handleDelete(idx)} />
          })}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={3}>
        <TextField id="outlined-basic" label="Input a tag" variant="outlined" value={tag} onChange={handleInputChange} />
        <TextField id="outlined-basic" label="Input repetition numbers" variant="outlined" value={repetitions} onChange={changeRepetitions} />

        <Button variant="outlined" onClick={handleAddTags}>Add Tag</Button>
        <Button variant="outlined" onClick={handleSubscribeOpen}>subscribe</Button>
        <Button variant="outlined" onClick={handleLogout}>logout</Button>
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
      {items === null || items.length == 0 ? "no contents" :
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
        </ImageList>}
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
