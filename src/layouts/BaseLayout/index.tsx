import { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';

import { Box } from '@mui/material';
import Footer from './Footer'
interface BaseLayoutProps {
  children?: ReactNode;
}

const BaseLayout: FC<BaseLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        flex: 1,
        background: 'linear-gradient(180deg, #000000 0%, #A067FF 300.51%)',
        position: 'relative'
      }}
    >
      <Box sx={{pb: '40px', height: '100%'}}>
        {children || <Outlet />}
      </Box>
      <Footer/>
    </Box>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node
};

export default BaseLayout;
