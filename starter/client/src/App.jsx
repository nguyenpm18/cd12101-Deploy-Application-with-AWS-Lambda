import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Grid, Menu, Segment, Loader } from 'semantic-ui-react';

import { EditTodo } from './components/EditTodo';
import { LogIn } from './components/LogIn';
import { NotFound } from './components/NotFound';
import { Todos } from './components/Todos';

export default function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  function generateMenu() {
    return (
      <Menu>
        <Menu.Item as={Link} to={'/'}>
          Home
        </Menu.Item>

        <Menu.Menu position="right">{logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  function logInLogOutButton() {
    if (isAuthenticated) {
      return (
        <Menu.Item name="logout" onClick={() => logout({ returnTo: window.location.origin })}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={() => loginWithRedirect()}>
          Log In
        </Menu.Item>
      )
    }
  }

    // Loader to display while authentication state is being determined
    if (isLoading) {
      return (
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Loader active inline="centered" />
        </Segment>
      );
    }
  
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <BrowserRouter>
                  {generateMenu()}
                  {generateCurrentPage(isAuthenticated)}
                </BrowserRouter>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    );
  }
  
  function generateCurrentPage(isAuthenticated) {
    if (!isAuthenticated) {
      return <LogIn />;
    }
  
    return (
      <Routes>
        <Route path="/" exact element={<Todos />} />
        <Route path="/todos/:todoId/edit" exact element={<EditTodo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }