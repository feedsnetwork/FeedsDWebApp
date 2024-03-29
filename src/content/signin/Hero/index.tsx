
import React from 'react'
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { DID } from '@elastosfoundation/elastos-connectivity-sdk-js';
import { VerifiablePresentation, DefaultDIDAdapter, DIDBackend } from '@elastosfoundation/did-js-sdk';
import jwt from 'jsonwebtoken';
import { Box, Button, Container, Grid, Typography, Link, Stack, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBack from '@mui/icons-material/ArrowBack';

import StyledButton from 'components/StyledButton';
import { essentialsConnector, initConnectivitySDK, isUsingEssentialsConnector } from '../EssentialConnectivity';
import { getDidResolverUrl } from 'config';
// import { useGlobalState } from 'global/store'
import { HiveApi } from 'services/HiveApi'
import { SidebarContext } from 'contexts/SidebarContext';
import { isInAppBrowser } from 'utils/common'
import { mainproc } from 'utils/mainproc';

const LinearProgressWrapper = styled(LinearProgress)(
  ({ theme }) => `
      flex-grow: 1;
      height: 15px;
      margin: ${theme.spacing(1, 0, 2)};
      
      &.MuiLinearProgress-root {
        background-color: ${theme.colors.alpha.black[10]};
      }
      
      .MuiLinearProgress-bar {
        border-radius: ${theme.general.borderRadiusXl};
      }
`
);

function Hero() {
  const [verifyState, setVerifyState] = React.useState(0)
  const [authProgress, setAuthProgress] = React.useState(0)
  const [activatingConnector, setActivatingConnector] = React.useState(null);
  const [isConnected2Hive, setIsConnected2Hive] = React.useState(false);
  const { setWalletAddress, setNeedQueryChannel } = React.useContext(SidebarContext);
  const hiveApi = new HiveApi()
  const dispatch = useDispatch()
  const propsInProc = { dispatch }
  const proc = mainproc(propsInProc)
  const queryProc = proc.queryProc
  let sessionLinkFlag = localStorage.getItem('FEEDS_LINK');
  
  const initializeWalletConnection = React.useCallback(async () => {
    if (!activatingConnector) {
      setWalletAddress(
        isInAppBrowser()
          ? await window['elastos'].getWeb3Provider().address
          : essentialsConnector.getWalletConnectProvider().wc.accounts[0]
      );
      setActivatingConnector(essentialsConnector);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector]);

  React.useEffect(()=>{
    if(sessionLinkFlag === '1') {
      setNeedQueryChannel(true)
      initializeWalletConnection()
      setVerifyState(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(()=>{
    if(verifyState === 1) {
      setAuthProgress(5)
      const checkApproval = setInterval(() => {
        if(sessionStorage.getItem('FEEDS_DID_PREV') === localStorage.getItem('FEEDS_DID')){
          clearInterval(checkApproval)
          setIsConnected2Hive(true)
          setAuthProgress(prev=>prev<25? 25: prev+25)
          return
        }
      }, 500);

      setNeedQueryChannel(false)
      Object.keys(queryProc).forEach(type=>{
        queryProc[type]()
          .then(_=>setAuthProgress(prev=>prev<25? 25: prev+25))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyState])

  React.useEffect(()=>{
    if(authProgress===100)
      setTimeout(()=>{ setVerifyState(2) }, 1000)
  }, [authProgress])

  const handleSignin = async (e) => {
    if (isUsingEssentialsConnector() && essentialsConnector.hasWalletConnectSession()) {
      await signOutWithEssentials();
    } else if (essentialsConnector.hasWalletConnectSession()) {
      await essentialsConnector.disconnectWalletConnect();
    }
    await signInWithEssentials();
    // setVerifyState(1)
  }

  const signInWithEssentials = async () => {
    initConnectivitySDK();
    const didAccess = new DID.DIDAccess();
    // let presentation;
    try {
      const presentation = await didAccess.requestCredentials({
        claims: [DID.simpleIdClaim('Your avatar', 'avatar', false), DID.simpleIdClaim('Your name', 'name', false), DID.simpleIdClaim('Your description', 'description', false)]
      });
      if (presentation) {
        const did = presentation.getHolder().getMethodSpecificId() || '';

        const DidResolverUrl = getDidResolverUrl()
        DIDBackend.initialize(new DefaultDIDAdapter(DidResolverUrl));
        // verify
        const vp = VerifiablePresentation.parse(JSON.stringify(presentation.toJSON()));
        // const valid = await vp.isValid();
        // if (!valid) {
        //   console.log('Invalid presentation');
        //   return;
        // }
        const sDid = vp.getHolder().toString();
        if (!sDid) {
          console.log('Unable to extract owner DID from the presentation');
          return;
        }
        // Optional name
        const nameCredential = vp.getCredential(`name`);
        const name = nameCredential ? nameCredential.getSubject().getProperty('name') : '';
        // Optional bio
        const bioCredential = vp.getCredential(`description`);
        const bio = bioCredential ? bioCredential.getSubject().getProperty('description') : '';

        // Optional email
        // const emailCredential = vp.getCredential(`email`);
        // const email = emailCredential ? emailCredential.getSubject().getProperty('email') : '';
        const user = {
          sDid,
          type: 'user',
          bio,
          name,
          // email,
          canManageAdmins: false
        };
        // succeed
        const token = jwt.sign(user, 'feeds', { expiresIn: 60 * 60 * 24 * 7 });
        localStorage.setItem('FEEDS_TOKEN', token);
        sessionStorage.setItem('FEEDS_DID_PREV', '');
        localStorage.setItem('FEEDS_DID', did);
        localStorage.setItem('FEEDS_LINK', '1');
        sessionLinkFlag = '1';

        // HIVE START
        hiveApi.prepareConnection()
          .then(async res => {
            console.log("Prepare Connection", "---------------------")
            await hiveApi.createAllCollections()
            console.log("create All Collections", "---------------------")
            await hiveApi.registeScripting()
            console.log("Register Scripting", "---------------------")
          })
        // HIVE END

        let essentialAddress = essentialsConnector.getWalletConnectProvider().wc.accounts[0]
        if (isInAppBrowser())
          essentialAddress = await window['elastos'].getWeb3Provider().address
        setWalletAddress(essentialAddress);
        setActivatingConnector(essentialsConnector);
        setVerifyState(1)
        // setSigninEssentialSuccess(true);
        // getAvatarUrl(did)
      } else {
        // console.log('User closed modal');
      }
    } catch (e) {
      try {
        await essentialsConnector.getWalletConnectProvider().disconnect();
      } catch (e) {
        console.log('Error while trying to disconnect wallet connect session', e);
      }
    }
  };

  const signOutWithEssentials = async () => {
    localStorage.removeItem('FEEDS_LINK');
    localStorage.removeItem('FEEDS_DID');
    try {
      // setSigninEssentialSuccess(false);
      setActivatingConnector(null);
      setWalletAddress(null);
      if (isUsingEssentialsConnector() && essentialsConnector.hasWalletConnectSession())
        await essentialsConnector.disconnectWalletConnect();
      if (isInAppBrowser() && (await window['elastos'].getWeb3Provider().isConnected()))
        await window['elastos'].getWeb3Provider().disconnect();
    } catch (error) {
      console.log('Error while disconnecting the wallet', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Link to="/home" component={RouterLink}>
          <Box component='img' src='/feeds-logo.svg' sx={{width: {xs: 80, md: 100, lg: 120}}}/>
        </Link>
      </Box>
      {
        verifyState===0 && <FadeIn>
          <Box>
            <Typography variant='h3' sx={{ my: {xs: 3, sm: 5, md: 7} }}>
              Hello! 👋<br/>Welcome to Feeds Network!
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledButton fullWidth onClick={handleSignin}>Sign in with DID</StyledButton>
              </Grid>
              <Grid item xs={12}>
                <StyledButton type="outline" fullWidth onClick={(e)=>{setVerifyState(3)}}>I don’t have a DID</StyledButton>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='caption'>
                  <Link href="https://www.elastos.org/did" underline="always" color='inherit' target="_blank">
                    What is a DID?
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </FadeIn>
      }
      {
        verifyState===1 && <FadeIn>
          <Stack spacing={2} sx={{ mt: {xs: 3, sm: 5, md: 7} }} alignItems='center'>
            <Typography variant='h3'>
              Authorization
            </Typography>
            <Typography variant='body2' sx={{opacity: .8}}>
              {
                !isConnected2Hive?
                "Connecting to Hive node...":
                "Importing channels..."
              }
            </Typography>
            <Box component='img' src='hive.svg' width={{xs: 80, md: 100, lg: 120}} height={{xs: 90, md: 110, lg: 130}} py={1} draggable={false}/>
            <Box width='100%'>
              <LinearProgressWrapper
                value={authProgress}
                color="primary"
                variant="determinate"
                sx={{
                  '.MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, #7624FE ${100 - authProgress}%, #368BFF 100%);`
                  }
                }}
              />
            </Box>
          </Stack>
        </FadeIn>
      }
      {
        verifyState===2 && <FadeIn>
          <Stack spacing={2} sx={{ mt: {xs: 3, sm: 5, md: 7} }} alignItems='center'>
            <Typography variant='h3' component='div'>
              Authorized
            </Typography>
            <Typography variant='body2' sx={{opacity: .8}}>
              Successful login to Hive node!
            </Typography>
            <Box component='img' src='feeds-complete.gif' width={{xs: 80, md: 100, lg: 120}} height={{xs: 90, md: 110, lg: 130}} py={1} draggable={false}/>
            <StyledButton component={RouterLink} to="/home" fullWidth>Let's go!</StyledButton>
          </Stack>
        </FadeIn>
      }
      {
        verifyState===3 && <FadeIn>
          <Box>
            <Typography variant='h3' sx={{ my: {xs: 3, sm: 5, md: 7} }}>
              Download Elastos Essentials app<br/>
              now to create your own DID!
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledButton fullWidth href="https://play.google.com/store/apps/details?id=org.elastos.essentials.app" target="_blank">Google Play</StyledButton>
              </Grid>
              <Grid item xs={12}>
                <StyledButton type="outline" fullWidth href="https://apps.apple.com/us/app/elastos-essentials/id1568931743" target="_blank">App Store</StyledButton>
              </Grid>
              <Grid item xs={12}>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<ArrowBack />}
                  onClick={()=>{setVerifyState(0)}}
                >
                Go back
                </Button>
              </Grid>
            </Grid>
          </Box>
        </FadeIn>
      }
    </Container>
  );
}

export default Hero;
