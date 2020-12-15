import * as React from 'react'
import Auth from '../auth/Auth'
import { Button } from 'semantic-ui-react'

interface LogInProps {
  auth: Auth
}

interface LogInState {}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  onLogin = () => {
    this.props.auth.login()
  }

  render() {
    return (
      <div>
        <h1>Don't you know what movie to watch next? List them!</h1>
        <h2>But first...</h2>

        <Button onClick={this.onLogin} size="huge" color="violet">
          Log in
        </Button>
      </div>
    )
  }
}
