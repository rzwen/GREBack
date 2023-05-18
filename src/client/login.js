import ReactDOM from "react-dom/client";
import React from 'react';


class Login extends React.Component {

    render() {
        return (
            <main>
                <hr />
                <div className="container">
                    <h1>Log In</h1>
                    <hr />
                    <form action="/login_check" method="post" id="loginForm">
                        Name: <input type="text" name="username" id="username" /> <br />
                        Password: <input type="password" name="userpwd" id="userpwd" /> <br />
                        {/* <span id="msg"></span> <br /> */}
                        <button type="button" id="loginBtn" onClick={(e) => this.props.check()} className="btn btn-outline-primary">Login</button>
                    </form>
                </div>
                <hr />
            </main>
        );
    }
}


export default Login;