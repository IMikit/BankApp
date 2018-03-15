import React, { Component } from 'react';
import { connect } from 'react-redux'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import { attemptLogin } from '../actions'

class Login extends Component {
    onLoginClick() {
        const { dispatch } = this.props

        let username = this.refs.username.input.value
        let password = this.refs.password.input.value

        dispatch(attemptLogin({
            username,
            password
        }))
    }

    render() {
        const { usernameValidationMessage, passwordValidationMessage } = this.props
        return (
            <div>
                <h3>Connexion</h3>

                <h4>Entrez votre nom d'utilisateur et votre mot de passe</h4>

                <div>
                    <TextField
                        hintText="Nom d'utilisateur"
                        floatingLabelText="Nom d'utilisateur"
                        ref="username"
                        errorText={usernameValidationMessage}
                    />
                </div>
                <div>
                    <TextField
                        hintText="Mot de passe"
                        floatingLabelText="Mot de passe"
                        type="password"
                        ref="password"
                        errorText={passwordValidationMessage}
                    />
                </div>
                <RaisedButton label="Connexion" primary={true} onClick={() => this.onLoginClick()} />
            </div>
        )
    }
}

const mapStateToProps = state => {
    const { login } = state
    return {
        usernameValidationMessage: login.usernameValidationMessage,
        passwordValidationMessage: login.passwordValidationMessage
    }
}

export default connect(mapStateToProps)(Login) 