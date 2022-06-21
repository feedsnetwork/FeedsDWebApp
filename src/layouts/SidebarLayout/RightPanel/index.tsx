import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  Box,
  Drawer,
  alpha,
  styled,
  Divider,
  useTheme,
  Button,
  lighten,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  darken,
  Tooltip,
  InputAdornment,
  OutlinedInput
} from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';


const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.rightPanel.width};
        min-width: ${theme.rightPanel.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);
const OutlinedInputWrapper = styled(OutlinedInput)(
  ({ theme }) => `
    background-color: ${theme.colors.alpha.white[100]};
    padding-right: ${theme.spacing(0.7)}
`
);
const ListWrapper = styled(List)(
  () => `
      .MuiListItem-root {
        border-radius: 0;
        margin: 0;
      }
`
);
function RightPanel() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          right: 0,
          top: 0,
          px: 2,
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        {/* <Scrollbar> */}
          <Box mt={3} pb={3}>
            <OutlinedInputWrapper
              type="text"
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              }
            />
          </Box>
          <Card>
            <CardHeader title="Trends" />
            <CardContent sx={{pt: 0}}>
              <ListWrapper disablePadding>
                <ListItem
                  sx={{
                    color: `${theme.colors.primary.main}`,
                    '&:hover': { color: `${theme.colors.primary.dark}` }
                  }}
                  button
                >
                  <ListItemText primary="#HTML" secondary="100 post" />
                </ListItem>
                <ListItem
                  sx={{
                    color: `${theme.colors.primary.main}`,
                    '&:hover': { color: `${theme.colors.primary.dark}` }
                  }}
                  button
                >
                  <ListItemText primary="#HTML" secondary="100 post" />
                </ListItem>
              </ListWrapper>
            </CardContent>
          </Card>
        {/* </Scrollbar> */}
      </SidebarWrapper>
    </>
  );
}

export default RightPanel;
