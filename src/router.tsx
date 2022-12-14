import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'layouts/SidebarLayout';
import BaseLayout from 'layouts/BaseLayout';

import SuspenseLoader from 'components/SuspenseLoader';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Pages

const SignIn = Loader(lazy(() => import('content/signin')));

// Applications

const Home = Loader(
  lazy(() => import('content/home'))
);
const PostDetail = Loader(
  lazy(() => import('content/post'))
)
const Profile = Loader(
  lazy(() => import('content/profile'))
);
const OthersProfile = Loader(
  lazy(() => import('content/profile/Others'))
);
const Channel = Loader(
  lazy(() => import('content/channel'))
);
const AddChannel = Loader(
  lazy(() => import('components/AddChannel'))
);
const Explore = Loader(
  lazy(() => import('content/explore'))
);
const PublicChannel = Loader(
  lazy(() => import('content/explore/channel'))
);
const Subscription = Loader(
  lazy(() => import('content/subscription'))
);
const SubscriptionChannel = Loader(
  lazy(() => import('content/subscription/channel'))
);
const SubscriptionList = Loader(
  lazy(() => import('content/subscription/list'))
);
const SubscriberList = Loader(
  lazy(() => import('content/subscriber/list'))
);
const AccountInfo = Loader(
  lazy(() => import('content/setting/profile'))
);
const Credentials = Loader(
  lazy(() => import('content/setting/credentials'))
);
const Language = Loader(
  lazy(() => import('content/setting/language'))
);
const ApiProvider = Loader(
  lazy(() => import('content/setting/api-provider'))
);
const AppPreference = Loader(
  lazy(() => import('content/setting/app-preference'))
);
const Connections = Loader(
  lazy(() => import('content/setting/connections'))
);
const About = Loader(
  lazy(() => import('content/setting/about'))
);
// Status

const Status404 = Loader(
  lazy(() => import('content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('content/pages/Status/Status500'))
);
const StatusComingSoon = Loader(
  lazy(() => import('content/pages/Status/ComingSoon'))
);
const StatusMaintenance = Loader(
  lazy(() => import('content/pages/Status/Maintenance'))
);

const routes: RouteObject[] = [
  {
    path: '',
    element: <BaseLayout />,
    children: [
      {
        path: '/',
        element: <SignIn />
      },
      {
        path: 'status',
        children: [
          {
            path: '',
            element: <Navigate to="404" replace />
          },
          {
            path: '404',
            element: <Status404 />
          },
          {
            path: '500',
            element: <Status500 />
          },
          {
            path: 'maintenance',
            element: <StatusMaintenance />
          },
          {
            path: 'coming-soon',
            element: <StatusComingSoon />
          }
        ]
      },
      {
        path: '*',
        element: <Status404 />
      }
    ]
  },
  {
    path: 'home',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Home />
      }
    ]
  },
  {
    path: 'post/:post_id',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <PostDetail />
      }
    ]
  },
  {
    path: 'profile',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Profile />
      },
      {
        path: 'others',
        element: <OthersProfile />
      }
    ]
  },
  {
    path: 'channel',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Channel />
      },
      {
        path: 'add',
        element: <AddChannel />
      },
      {
        path: 'edit/:channelId',
        element: <AddChannel action="edit" />
      }
    ]
  },
  {
    path: 'explore',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Explore />
      },
      {
        path: 'channel',
        element: <PublicChannel/>
      }
    ]
  },
  {
    path: 'subscription',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Subscription />
      },
      {
        path: 'channel',
        element: <SubscriptionChannel/>
      },
      {
        path: 'list/:userDid',
        element: <SubscriptionList/>
      }
    ]
  },
  {
    path: 'subscriber',
    element: <SidebarLayout />,
    children: [
      {
        path: 'list/:channelId',
        element: <SubscriberList/>
      }
    ]
  },
  {
    path: 'setting',
    element: <SidebarLayout maxWidth='lg'/>,
    children: [
      {
        path: '',
        element: <Navigate to="profile" replace />
      },
      {
        path: 'profile',
        element: <AccountInfo />
      },
      {
        path: 'credentials',
        element: <Credentials />
      },
      {
        path: 'language',
        element: <Language />
      },
      {
        path: 'api',
        element: <ApiProvider />
      },
      {
        path: 'preferences',
        element: <AppPreference />
      },
      {
        path: 'connections',
        element: <Connections />
      },
      {
        path: 'about',
        element: <About />
      },
    ]
  },
];

export default routes;
