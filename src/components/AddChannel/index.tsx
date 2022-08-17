import { FC, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import { Box, Typography, Stack, Card, Input, IconButton, Grid, styled } from '@mui/material';

import StyledButton from 'src/components/StyledButton';
import { HiveApi } from 'src/services/HiveApi';

const hiveApi = new HiveApi()

const AvatarWrapper = styled(Box)(
  ({ theme }) => `
    position: relative;
    overflow: visible;
    display: inline-block;
`
);

const ButtonUploadWrapper = styled(Box)(
  ({ theme }) => `
    position: absolute;
    width: ${theme.spacing(4)};
    height: ${theme.spacing(4)};
    bottom: -${theme.spacing(0)};
    right: -${theme.spacing(0)};

    .MuiIconButton-root {
      border-radius: 100%;
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      width: ${theme.spacing(4)};
      height: ${theme.spacing(4)};
      padding: 0;
  
      &:hover {
        background: ${theme.colors.primary.dark};
      }
    }
`
);

const AvatarInput = styled('input')({
  display: 'none'
});

interface AddChannelProps {
  // type?: string;
}
const AddChannel: FC<AddChannelProps> = (props)=>{
  const [avatarUrl, setAvatarUrl] = useState(null);
  const nameRef = useRef(null)
  const descriptionRef = useRef(null)
  const tippingRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar();
  
  const handleFileChange = event => {
    const fileObj = event.target.files && event.target.files[0];
    if (fileObj) {
      const tempFileObj = Object.assign(fileObj, {preview: URL.createObjectURL(fileObj)})
      setAvatarUrl(tempFileObj);
    }
  };

  const saveAction = (e) => {
    if(avatarUrl) {
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(avatarUrl);
      reader.onloadend = async() => {
        try {
          const fileContent = Buffer.from(reader.result as ArrayBuffer)
          const bs64Content = fileContent.toString('base64')
          hiveApi.createChannel(nameRef.current.value, descriptionRef.current.value, bs64Content, tippingRef.current.value)
            .then(result=>{
              console.log(result)
              enqueueSnackbar('Add channel success', { variant: 'success' });
            })
            .catch(error=>{
              console.log(error)
              enqueueSnackbar('Add channel error', { variant: 'error' });
            })
        } catch (error) {
        }
      }
    }
  }

  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <AvatarWrapper>
            <Box component='img' src={avatarUrl?avatarUrl.preview:'user-circle.svg'} draggable={false} sx={{ width: 90, height: 90, borderRadius: '50%'}}/>
            <ButtonUploadWrapper>
              <AvatarInput
                accept="image/*"
                id="icon-button-file"
                name="icon-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="icon-button-file">
                <IconButton component="span" color="primary">
                  <Icon icon="akar-icons:edit" />
                </IconButton>
              </label>
            </ButtonUploadWrapper>
          </AvatarWrapper>
          <Grid container direction="column">
            <Grid item>
              <Typography variant='subtitle1'>Name</Typography>
              <Input placeholder="Add channel name" fullWidth inputRef={nameRef}/>
            </Grid>
            <Grid item py={2}>
              <Typography variant='subtitle1'>Description</Typography>
              <Input placeholder="Add channel description" fullWidth inputRef={descriptionRef}/>
            </Grid>
            <Grid item>
              <Typography variant='subtitle1'>Tipping Address</Typography>
              <Input placeholder="Enter tipping address" fullWidth inputRef={tippingRef}/>
            </Grid>
          </Grid>
          <Box width={200}>
            <StyledButton fullWidth onClick={saveAction}>Create</StyledButton>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}

AddChannel.propTypes = {
  // type: PropTypes.oneOf([
  //   'home',
  //   'channel',
  //   'subscription',
  // ])
};

export default AddChannel;
