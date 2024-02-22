def pytest_addoption(parser):
    parser.addoption("--hostname", default="localhost")
    parser.addoption("--port", default="6379")
    parser.addoption("--password")
    parser.addoption("--namespace")
    parser.addoption("--backup_bucket")


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

    namespace = metafunc.config.option.namespace
    if 'namespace' in metafunc.fixturenames and namespace is not None:
        metafunc.parametrize("namespace", [namespace])

    backup_bucket = metafunc.config.option.backup_bucket
    if 'backup_bucket' in metafunc.fixturenames and backup_bucket is not None:
        metafunc.parametrize("backup_bucket", [backup_bucket])