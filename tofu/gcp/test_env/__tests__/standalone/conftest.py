def pytest_addoption(parser):
    parser.addoption("--hostname", default="localhost")
    parser.addoption("--port", default="6379")
    parser.addoption("--password")


def pytest_generate_tests(metafunc):
    # This is called for every test. Only get/set command line arguments
    # if the argument is specified in the list of test "fixturenames".
    hostname = metafunc.config.option.hostname
    if 'hostname' in metafunc.fixturenames and hostname is not None:
        metafunc.parametrize("hostname", [hostname])
    
    port = metafunc.config.option.port
    if 'port' in metafunc.fixturenames and port is not None:
        metafunc.parametrize("port", [port])
    
    password = metafunc.config.option.password
    if 'password' in metafunc.fixturenames and password is not None:
        metafunc.parametrize("password", [password])