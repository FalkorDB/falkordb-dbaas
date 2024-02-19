from falkordb import FalkorDB
import logging


def test_connect(hostname, port, password):
    logging.debug(f"Connecting to FalkorDB at {hostname}:{port}")

    assert hostname is not None
    assert port is not None and port.isdigit()

    try:
        db = FalkorDB(hostname, port, password)

        graph = db.select_graph("test")

        res = graph.query("RETURN 1")

        assert res.result_set[0][0] == 1

    except Exception as e:
        logging.error(e)
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
        logging.error(e)
        assert False
