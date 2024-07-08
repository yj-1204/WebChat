import { useContext } from "react";
import {Alert, Button, Form, Row, Col, Stack} from "react-bootstrap"
import { AuthContext } from "../context/AuthContext";

const Login = () => {

    const {loginUser, updateLoginInfo, loginError, loginInfo, isLoginLoading , logoutUser} = useContext(AuthContext)
    return (
    <>
        <Form onSubmit = {loginUser}>
            <Row
                style = {{
                    height: "100vh",
                    justifyContent: "center",
                    paddingTop:"10%",
                }}>
                <Col xs={4}>
                    <Stack gap={3}>
                        <h2>Login</h2>
                        <Form.Control type='text' placeholder="email" onChange = {(e)=>{updateLoginInfo({...loginInfo, email : e.target.value})}}></Form.Control>
                        <Form.Control type='password' placeholder="password" onChange = {(e)=> {updateLoginInfo({...loginInfo, password : e.target.value})}}></Form.Control>
                        <Button variant="primary" type="submit">{isLoginLoading? "Getting you in.." :  "Login"}</Button>
                        {loginError?.error && (<Alert variant='danger'><p>{loginError?.message}</p></Alert>)}
                    </Stack>
                </Col>
            </Row>
        </Form>
    </>  
    );
}
export default Login;