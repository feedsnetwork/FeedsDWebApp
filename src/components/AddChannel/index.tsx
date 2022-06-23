import { FC, useContext } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { Box, Typography, Stack, Card, Input, IconButton, Grid, styled } from '@mui/material';

import StyledButton from 'src/components/StyledButton';

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
const AddChannel: FC<AddChannelProps> = ({ })=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <AvatarWrapper>
            <Box component='img' src='user-circle.svg' draggable={false}/>
            <ButtonUploadWrapper>
              <AvatarInput
                accept="image/*"
                id="icon-button-file"
                name="icon-button-file"
                type="file"
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
              <Input placeholder="Add channel name" fullWidth/>
            </Grid>
            <Grid item py={2}>
              <Typography variant='subtitle1'>Description</Typography>
              <Input placeholder="Add channel description" fullWidth/>
            </Grid>
            <Grid item>
              <Typography variant='subtitle1'>Tipping Address</Typography>
              <Input placeholder="Enter tipping address" fullWidth/>
            </Grid>
          </Grid>
          <Box width={200}>
            <StyledButton fullWidth>Create</StyledButton>
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
