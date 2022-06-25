import { ChangeEvent, useState } from 'react';
import { Box, Stack, Grid, Radio, FormControlLabel, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'

const AvatarAddWrapper = styled(Avatar)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        color: ${theme.colors.primary.main};
        width: ${theme.spacing(8)};
        height: ${theme.spacing(8)};
`
);

const CardLogo = styled('img')(
  ({ theme }) => `
      border: 1px solid ${theme.colors.alpha.black[30]};
      border-radius: ${theme.general.borderRadius};
      padding: ${theme.spacing(1)};
      margin-right: ${theme.spacing(2)};
      background: ${theme.colors.alpha.white[100]};
`
);

const CardAddAction = styled(Card)(
  ({ theme }) => `
        border: ${theme.colors.primary.main} dashed 1px;
        height: 100%;
        color: ${theme.colors.primary.main};
        box-shadow: none;
        
        .MuiCardActionArea-root {
          height: 100%;
          justify-content: center;
          align-items: center;
          display: flex;
        }
        
        .MuiTouchRipple-root {
          opacity: .2;
        }
        
        &:hover {
          border-color: ${theme.colors.alpha.black[100]};
        }
`
);

const IconButtonError = styled(IconButton)(
  ({ theme }) => `
     background: ${theme.colors.error.lighter};
     color: ${theme.colors.error.main};
     padding: ${theme.spacing(0.5)};

     &:hover {
      background: ${lighten(theme.colors.error.lighter, 0.4)};
     }
`
);

const CardCc = styled(Card)(
  ({ theme }) => `
     border: 1px solid ${theme.colors.alpha.black[30]};
     background: ${theme.colors.alpha.black[5]};
     box-shadow: none;
`
);

function MyCards() {
  const data = {
    savedCards: 7
  };

  const [selectedValue, setSelectedValue] = useState('a');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleDelete = () => { };

  return (
    <Card>
      {/* <CardHeader subheader='@ElastosInfo' title="Elastos" /> */}
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg'/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                Elastos Info{' '}<Typography variant="body2" sx={{display: 'inline'}}>1m</Typography>
              </Typography>
              <Typography variant="body2" noWrap>
                @ElastosInfo
              </Typography>
            </Box>
            <Box>
              <StyledButton type="outlined">Subscribe</StyledButton>
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
          <Typography variant="body2">
            Good weather today in Osaka! Hmm... where should I eat in Tennouji? Any recommendations? I’m thinking of eating raw sushi for the first time though... I hope it’s gonna be alright haha#osaka #japan #spring
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default MyCards;
