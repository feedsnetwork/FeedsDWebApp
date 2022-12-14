import { Container } from '@mui/material';

import { EmptyView } from 'components/EmptyView'

function Subscription() {
  const isEmpty = true
  return (
    <>
      {
        isEmpty?
        <EmptyView type='subscription'/>:

        <Container sx={{ mt: 3 }} maxWidth="lg"></Container>
      }
    </>
  );
}

export default Subscription;
