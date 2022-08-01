import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router';

import SidebarLayout from 'src/layouts/SidebarLayout';
import BaseLayout from 'src/layouts/BaseLayout';

import SuspenseLoader from 'src/components/SuspenseLoader';

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Pages

const SignIn = Loader(lazy(() => import('src/content/signin')));

// Dashboards

const Tasks = Loader(lazy(() => import('src/content/dashboards/Tasks')));

// Applications

const Home = Loader(
  lazy(() => import('src/content/home'))
);
const Channel = Loader(
  lazy(() => import('src/content/channel'))
);
const Explorer = Loader(
  lazy(() => import('src/content/explorer'))
);
const Subscription = Loader(
  lazy(() => import('src/content/subscription'))
);
const AccountInfo = Loader(
  lazy(() => import('src/content/setting/profile'))
);
const Credentials = Loader(
  lazy(() => import('src/content/setting/credentials'))
);
const Language = Loader(
  lazy(() => import('src/content/setting/language'))
);
const ApiProvider = Loader(
  lazy(() => import('src/content/setting/api-provider'))
);
// const Messenger = Loader(
//   lazy(() => import('src/content/applications/Messenger'))
// );
// const Transactions = Loader(
//   lazy(() => import('src/content/applications/Transactions'))
// );
// const UserSettings = Loader(
//   lazy(() => import('src/content/applications/Users/settings'))
// );

// Components

// const Buttons = Loader(
//   lazy(() => import('src/content/pages/Components/Buttons'))
// );
// const Modals = Loader(
//   lazy(() => import('src/content/pages/Components/Modals'))
// );
// const Accordions = Loader(
//   lazy(() => import('src/content/pages/Components/Accordions'))
// );
// const Tabs = Loader(lazy(() => import('src/content/pages/Components/Tabs')));
// const Badges = Loader(
//   lazy(() => import('src/content/pages/Components/Badges'))
// );
// const Tooltips = Loader(
//   lazy(() => import('src/content/pages/Components/Tooltips'))
// );
// const Avatars = Loader(
//   lazy(() => import('src/content/pages/Components/Avatars'))
// );
// const Cards = Loader(lazy(() => import('src/content/pages/Components/Cards')));
// const Forms = Loader(lazy(() => import('src/content/pages/Components/Forms')));

// Status

const Status404 = Loader(
  lazy(() => import('src/content/pages/Status/Status404'))
);
const Status500 = Loader(
  lazy(() => import('src/content/pages/Status/Status500'))
);
const StatusComingSoon = Loader(
  lazy(() => import('src/content/pages/Status/ComingSoon'))
);
const StatusMaintenance = Loader(
  lazy(() => import('src/content/pages/Status/Maintenance'))
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
    path: 'channel',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Channel />
      }
    ]
  },
  {
    path: 'explorer',
    element: <SidebarLayout />,
    children: [
      {
        path: '',
        element: <Explorer />
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
      }
    ]
  },
  {
    path: 'setting',
    element: <SidebarLayout />,
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
    ]
  },
  // {
  //   path: 'management',
  //   element: <SidebarLayout />,
  //   children: [
  //     {
  //       path: '',
  //       element: <Navigate to="transactions" replace />
  //     },
  //     {
  //       path: 'transactions',
  //       element: <Transactions />
  //     },
  //     {
  //       path: 'profile',
  //       children: [
  //         {
  //           path: '',
  //           element: <Navigate to="details" replace />
  //         },
  //         {
  //           path: 'details',
  //           element: <UserProfile />
  //         },
  //         {
  //           path: 'settings',
  //           element: <UserSettings />
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   path: '/components',
  //   element: <SidebarLayout />,
  //   children: [
  //     {
  //       path: '',
  //       element: <Navigate to="buttons" replace />
  //     },
  //     {
  //       path: 'buttons',
  //       element: <Buttons />
  //     },
  //     {
  //       path: 'modals',
  //       element: <Modals />
  //     },
  //     {
  //       path: 'accordions',
  //       element: <Accordions />
  //     },
  //     {
  //       path: 'tabs',
  //       element: <Tabs />
  //     },
  //     {
  //       path: 'badges',
  //       element: <Badges />
  //     },
  //     {
  //       path: 'tooltips',
  //       element: <Tooltips />
  //     },
  //     {
  //       path: 'avatars',
  //       element: <Avatars />
  //     },
  //     {
  //       path: 'cards',
  //       element: <Cards />
  //     },
  //     {
  //       path: 'forms',
  //       element: <Forms />
  //     }
  //   ]
  // }
];

export default routes;
