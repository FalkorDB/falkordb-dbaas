from falkordb import FalkorDB
from kubernetes import client, config
from kubernetes.stream import stream
import subprocess

config.load_kube_config()
k8s_api = client.CoreV1Api()


def test_connect(hostname, port, password):
    print(f"Connecting to FalkorDB at {hostname}:{port}")

    assert hostname is not None
    assert port is not None and port.isdigit()

    try:
        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("RETURN 1")

        assert res.result_set[0][0] == 1

    except Exception as e:
        print(e)
        assert False


def test_read_write_delete(hostname, port, password):
    try:
        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("CREATE (n:Person {name: 'John Doe'}) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        res = graph.query("MATCH (n:Person) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        graph.query("MATCH (n:Person) DELETE n")

        res = graph.query("MATCH (n:Person) RETURN n")

        assert len(res.result_set) == 0

    except Exception as e:
        print(e)
        assert False


def test_read_write_delete_replica(hostname, port, password, namespace):
    try:

        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("CREATE (n:Person {name: 'John Doe'}) RETURN n")

        assert res.result_set[0][0].properties["name"] == "John Doe"

        # Get slave by label
        slaves = k8s_api.list_namespaced_pod(
            namespace="{}".format(namespace),
            label_selector="cloud.falkordb.io/role=slave",
        )

        assert len(slaves.items) == 1, "There should be one slave"

        slave_name = slaves.items[0].metadata.name

        # Execute query on slave
        resp = stream(
            k8s_api.connect_get_namespaced_pod_exec,
            slave_name,
            namespace,
            container="redis",
            command=[
                "/bin/sh",
                "-c",
                f"redis-cli -p {port} -a {password} --no-auth-warning GRAPH.RO_QUERY test 'MATCH (n:Person) RETURN n'",
            ],
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        assert "John Doe" in resp

        graph.query("MATCH (n:Person) DELETE n")

        # Execute query on slave
        resp2 = stream(
            k8s_api.connect_get_namespaced_pod_exec,
            slave_name,
            namespace,
            container="redis",
            command=[
                "/bin/sh",
                "-c",
                f"redis-cli -p {port} -a {password} --no-auth-warning GRAPH.RO_QUERY test 'MATCH (n:Person) RETURN n'",
            ],
            stderr=True,
            stdin=False,
            stdout=True,
            tty=False,
        )

        assert "John Doe" not in resp2

    except Exception as e:
        print(e)
        assert False
