import React from 'react';
import { useSelector } from 'react-redux';
import { Collapse, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { SidebarContext } from 'contexts/SidebarContext';
import { selectLoadedPostCount } from 'redux/slices/post';

function BannerNotice() {
  const { needQueryChannel } = React.useContext(SidebarContext)
  const loadedPostCount = useSelector(selectLoadedPostCount)
  const [isOpenedAlert, setIsOpenedAlert] = React.useState(false)
  React.useEffect(()=>{
    if(!needQueryChannel && loadedPostCount)
      setIsOpenedAlert(true)
  }, [needQueryChannel, loadedPostCount])

  return (
    <Collapse in={isOpenedAlert}>
      <Alert
        severity="info"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setIsOpenedAlert(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{borderRadius: 0}}
      >
        Loading posts...✨ It may take some time ⏱️ so feel free to browse around while waiting for the loading to complete 🙏
      </Alert>
    </Collapse>
  );
}

export default React.memo(BannerNotice);