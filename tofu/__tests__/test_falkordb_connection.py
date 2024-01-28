import os
from falkordb import FalkorDB


def test_falkordb_connection():
    """Test the connection to FalkorDB"""

    host = os.environ.get("FALKORDB_HOST")
    port = os.environ.get("FALKORDB_PORT")
    password = os.environ.get("FALKORDB_PASSWORD")

    print(f"Connecting to FalkorDB at {host}:{port}")

    assert host is not None
    assert port is not None and port.isdigit()

    try:
        db = FalkorDB(host, port, password)

        graph = db.select_graph("test")

        res = graph.query("RETURN 1")

        assert res.result_set[0][0] == 1

    except Exception as e:
        print(e)
        assert False
