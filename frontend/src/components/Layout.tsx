import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Menu, Sidebar, Segment, Icon, Button } from 'semantic-ui-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, state } = useAuth();
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Invoices', href: '/invoices', icon: 'file text outline' },
    { name: 'Customers', href: '/customers', icon: 'users' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          as={Menu}
          animation='push'
          icon='labeled'
          inverted
          onHide={() => setSidebarVisible(false)}
          vertical
          visible={sidebarVisible}
          width='thin'
        >
          {navigation.map((item) => (
            <Menu.Item
              key={item.name}
              as={Link}
              to={item.href}
              active={location.pathname === item.href}
              onClick={() => setSidebarVisible(false)}
            >
              <Icon name={item.icon as any} />
              {item.name}
            </Menu.Item>
          ))}
        </Sidebar>

        <Sidebar.Pusher dimmed={sidebarVisible}>
          <Menu fixed='top' inverted>
            <Container>
              <Menu.Item
                as='a'
                onClick={() => setSidebarVisible(true)}
              >
                <Icon name='sidebar' />
              </Menu.Item>
              <Menu.Item header>
                <Icon name='file text outline' />
                InvoiceGen
              </Menu.Item>

              <Menu.Menu position='right'>
                <Menu.Item>
                  <Icon name='user' />
                  {state.user?.name}
                </Menu.Item>
                <Menu.Item>
                  <Button 
                    basic 
                    inverted 
                    onClick={logout}
                    size='small'
                  >
                    Sign Out
                  </Button>
                </Menu.Item>
              </Menu.Menu>
            </Container>
          </Menu>

          <Container style={{ marginTop: '7em', paddingBottom: '2em' }}>
            {children}
          </Container>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </div>
  );
};

export default Layout;
